# Development Notes

Technical decisions, gotchas, and setup details discovered during implementation.

## PocketBase Configuration

### Static File Serving

PocketBase serves static files from `pb_public/` by default. The **default path is relative to the PocketBase binary location**, not the working directory.

- Binary at: `./pocketbase/pocketbase`
- Default public dir: `./pocketbase/pb_public/`

To serve from a different location, use the `--publicDir` flag:

```bash
./pocketbase/pocketbase serve --publicDir=./pb_public
```

### Field Options in REST API

**Issue:** When creating collections via the REST API, wrapping field options inside an `options` key causes `validation_required` / `"Cannot be blank"` errors. This affects all field types — `relation`, `select`, `text`, etc.

**Wrong** (causes validation error):
```json
{
  "name": "food",
  "type": "relation",
  "options": {"collectionId": "pbc_xxx", "maxSelect": 1}
}
```

**Correct** (options at the top level):
```json
{
  "name": "food",
  "type": "relation",
  "collectionId": "pbc_xxx",
  "maxSelect": 1
}
```

This is confirmed by the PocketBase source code (`core/field_relation.go`) — the `RelationField` struct has `CollectionId`, `MaxSelect`, `CascadeDelete`, etc. as top-level Go struct fields with `form`/`json` tags, not nested under an `options` object.

**Alternative:** Create the collection without relations via REST API, then add relation fields through the PocketBase dashboard UI.

## Quasar Configuration

### Build Output Directory

By default, Quasar builds to `src/dist/spa/`. To output directly to `pocketbase/pb_public/`, set `distDir` in `quasar.config.js`:

```javascript
build: {
  distDir: '../pocketbase/pb_public',
  vueRouterMode: 'hash'
}
```

This eliminates the need for a copy step. The build command becomes simply:

```bash
cd src && pnpm build
```

### Content Security Policy (CSP)

The `index.html` template includes a CSP meta tag. In development mode, you need to allow connections to PocketBase:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';<% if (ctx.dev) { %> connect-src 'self' ws://localhost:* http://127.0.0.1:8090; worker-src 'self' blob:;<% } %>"
/>
```

In production (served by PocketBase), the app and API share the same origin, so no additional `connect-src` is needed.

## Field Naming Conventions

PocketBase uses `snake_case` for field names in the database and API responses (e.g., `food_id`, `energy_kcal`). The JavaScript SDK passes through these names as-is — it does **not** auto-convert to camelCase.

When creating records, use the exact field names as defined in the collection:

```javascript
await pocketbaseClient.collection('meal_entries').create({
  food_id: 'abc123',
  food_description: 'Arroz branco',
  quantity_g: 200,
  energy_kcal: 258
})
```

In your Vue components, you can map these to camelCase for convenience:

```javascript
const entry = {
  id: record.id,
  foodId: record.food_id,
  foodDescription: record.food_description
}
```

## Environment Variables

### Server-side: OpenCode Go API Key

The AI API key (for DeepSeek V4 Flash and Mimo V2.5 via OpenCode Go) is used **only in PocketBase hooks**, never in the frontend. This keeps the key secure — it's never exposed to the browser.

PocketBase hooks access environment variables via `$os.getenv()`:

```javascript
// pocketbase/pb_hooks/meal-parser.pb.js
"authorization": "Bearer " + $os.getenv("OPENCODE_GO_API_KEY")
```

**How to set the key:**

Option 1 — System environment variable (recommended for production):
```bash
export OPENCODE_GO_API_KEY=your_key_here
./pocketbase/pocketbase serve
```

Option 2 — `.env` file in the PocketBase directory (convenient for development):
```bash
# pocketbase/.env
OPENCODE_GO_API_KEY=your_key_here
```

PocketBase automatically loads `.env` from its working directory. No `QCLI_` prefix is needed — this is a server-side variable, not a frontend variable.

**TODO:** Add `pocketbase/.env.example` with `OPENCODE_GO_API_KEY=` placeholder.

### Frontend: Quasar `.env` files (not currently needed)

If you ever need to expose variables to the Quasar frontend (e.g., a public analytics ID), Quasar supports `.env` files with the `QCLI_` prefix:

```bash
# src/.env
QCLI_SOME_PUBLIC_KEY=abc123
```

```javascript
// In Vue components
const value = import.meta.env.QCLI_SOME_PUBLIC_KEY
```

Only `QCLI_`-prefixed variables are exposed to the browser. This project doesn't currently need any frontend env vars.

## Architecture Decisions

### Why `pb_public/` is inside `pocketbase/`

The project structure separates concerns:
- `pocketbase/` — runtime artifacts (binary, data, migrations, built frontend)
- `src/` — source code (Quasar app)

Since `pocketbase/` is gitignored, the built frontend (`pb_public/`) doesn't clutter the repository. It's regenerated on every `pnpm build`.

### Relation Fields and `expand` in `meal_entries`

The `meal_entries` collection uses a proper `relation` field to reference `foods`:

```
meal_entries:
  - food (relation → foods)
  - quantity_g (number)
  - meal_type (text)
  - consumed_at (date)
  - energy_kcal, protein_g, carbohydrate_g, lipid_g, fiber_g (number)
```

When listing entries, use `expand: 'food'` to fetch the related food record inline:

```javascript
const entries = await pocketbaseClient.collection('meal_entries').getFullList({
  expand: 'food'
})
// Access: entry.expand.food.description, entry.expand.food.energy_kcal, etc.
```

Nutrition values are pre-calculated and stored on the entry (based on `food.energy_kcal * (quantity_g / 100)` at creation time) so they remain consistent even if the food database is updated later.

## Build and Deploy Workflow

```bash
# 1. Build frontend to pocketbase/pb_public/
cd src && pnpm build

# 2. Start PocketBase (serves API + static files)
cd .. && ./pocketbase/pocketbase serve

# 3. Access the app
# http://127.0.0.1:8090
```

For development with hot reload:

```bash
# Terminal 1: Quasar dev server
cd src && pnpm dev

# Terminal 2: PocketBase
cd .. && ./pocketbase/pocketbase serve

# Access Quasar dev server (e.g., http://localhost:9000)
# It connects to PocketBase API at http://127.0.0.1:8090
```
