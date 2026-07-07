# Development Notes

Technical decisions, gotchas, and setup details discovered during implementation.

## Environment Variables

### OpenCode Go API Key

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
