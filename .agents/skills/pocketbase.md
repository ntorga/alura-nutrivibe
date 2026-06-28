---
shortDescription: "Single-file Go backend with embedded SQLite, realtime subscriptions, auth, and REST API"
version: "1.4.0"
lastUpdated: "2026-06-28"
---

## Purpose

PocketBase is an open-source backend in a single Go binary. It provides an embedded SQLite database with realtime subscriptions, built-in auth management, a dashboard UI, and a REST-ish API. Use it to stand up a full backend without external services — just download the binary, run `./pocketbase serve`, and you have a working API server on `http://127.0.0.1:8090`.

## Procedure

### 1. Setup and installation

#### Download the binary (agent-driven)

**Pre-flight 1/2: reject PowerShell.** PocketBase install requires bash or zsh:

```bash
[ -z "$PSVersionTable" ] || { echo "ERROR: PowerShell detected. Open bash/zsh or install WSL: wsl --install"; exit 1; }
```

**Pre-flight 2/2: ensure curl and unzip exist.** Install if missing:

```bash
osName=$(uname -s | tr '[:upper:]' '[:lower:]')

installPackage() {
  local packageName="$1"
  [ "$osName" = "darwin" ] && brew install "$packageName" && return
  [ -f /etc/os-release ] || { echo "ERROR: Cannot detect distro. Install $packageName manually."; exit 1; }
  . /etc/os-release
  local distroId="$ID"
  case "$distroId" in
    debian|ubuntu|linuxmint)        sudo apt-get install -y "$packageName" ;;
    fedora|rhel|centos|rocky|alma)  sudo dnf install -y "$packageName" ;;
    *)                              echo "ERROR: Unsupported distro '$distroId'. Install $packageName manually."; exit 1 ;;
  esac
}

command -v curl   &>/dev/null || installPackage curl
command -v unzip  &>/dev/null || installPackage unzip
```

Then detect architecture, fetch latest version, download, and extract:

```bash
# Detect architecture
cpuArch=$(uname -m)
case "$cpuArch" in
  x86_64)  cpuArch="amd64" ;;
  aarch64) cpuArch="arm64" ;;
  armv7l)  cpuArch="armv7" ;;
esac

# Fetch latest version from GitHub API
latestVersion=$(curl -s https://api.github.com/repos/pocketbase/pocketbase/releases/latest | grep '"tag_name"' | sed -E 's/.*"v([^"]+)".*/\1/')

# Download and extract
downloadUrl="https://github.com/pocketbase/pocketbase/releases/download/v${latestVersion}/pocketbase_${latestVersion}_${osName}_${cpuArch}.zip"
curl -L -o /tmp/pocketbase.zip "$downloadUrl"
unzip /tmp/pocketbase.zip -d ./pocketbase
rm /tmp/pocketbase.zip

# Verify
./pocketbase/pocketbase --version
```

Available OS/arch combinations from GitHub releases:
- OS: `linux`, `darwin`, `windows`
- Arch: `amd64`, `arm64`, `armv7`, `ppc64le`, `s390x`

#### First run

**Pre-flight: verify pocketbase binary exists:**

```bash
[ -x ./pocketbase/pocketbase ] || { echo "ERROR: PocketBase binary not found. Run the download step first."; exit 1; }
```

First run generates an installer link for the superuser account. Create manually if needed:

```bash
./pocketbase/pocketbase superuser create adminEmail adminPassword
```

Default routes after `serve`:
- `http://127.0.0.1:8090` — static content from `pb_public/` (if exists)
- `http://127.0.0.1:8090/_/` — superuser dashboard
- `http://127.0.0.1:8090/api/` — REST-ish API

Auto-generated directories:
- `pb_data` — application data, uploaded files (add to `.gitignore`)
- `pb_migrations` — JS migration files with collection changes (commit to repo)
- `pb_hooks` — custom Go/JS hooks for extending PocketBase (commit to repo)

### 2. Collections (data modeling)

Collections are SQLite tables defined by name and fields. Three types:

- **Base** — general-purpose data (articles, products, posts)
- **View** — read-only, populated by SQL `SELECT` (aggregations, custom queries)
- **Auth** — like Base + auth fields (`email`, `emailVisibility`, `verified`, `password`, `tokenKey`)

#### Available field types

REST API type names (lowercase) and their Go equivalents:

- `text` (`TextField`) — string (default: `""`)
- `number` (`NumberField`) — numeric/float64 (default: `0`)
- `bool` (`BoolField`) — `true`/`false` (default: `false`)
- `email` (`EmailField`) — email string (default: `""`)
- `url` (`URLField`) — URL string (default: `""`)
- `editor` (`EditorField`) — HTML text (default: `""`)
- `date` (`DateField`) — RFC3339 datetime `Y-m-d H:i:s.uZ` (default: `""`)
- `autodate` (`AutodateField`) — auto-set on create/update
- `select` (`SelectField`) — single/multiple from predefined list (default: `""` or `[]`)
- `file` (`FileField`) — file reference, stored on disk or S3 (default: `""` or `[]`)
- `relation` (`RelationField`) — reference to another collection record (default: `""` or `[]`)
- `json` (`JSONField`) — any serialized JSON, nullable (default: `null`)
- `geoPoint` (`GeoPoint`) — `{lon, lat}` coordinates (default: `{lon:0, lat:0}`)

#### REST API — collection CRUD

Create collections programmatically via the REST API (requires superuser auth):

```bash
# Auth as superuser
superuserToken=$(curl -s -X POST 'http://127.0.0.1:8090/api/collections/_superusers/auth-with-password' \
  -H 'Content-Type: application/json' \
  -d '{"identity":"admin@nutrivibe.local","password":"NutriVibe2026!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

# Create collection (use "fields" key, NOT "schema")
curl -X POST 'http://127.0.0.1:8090/api/collections' \
  -H 'Content-Type: application/json' \
  -H "Authorization: $superuserToken" \
  -d '{
    "name": "posts",
    "type": "base",
    "fields": [
      {"name": "title", "type": "text", "options": {"min": 1}},
      {"name": "views", "type": "number"},
      {"name": "status", "type": "select", "options": {"values": ["draft","published"], "maxSelect": 1}}
    ],
    "listRule": "",
    "viewRule": ""
  }'
```

**Gotchas:**
- Use `fields` key (not `schema`) when creating collections via REST API.
- Auth token goes in the `Authorization` header, not as a query parameter.
- Number fields need no `options` object (or pass `{}`).
- Select fields may fail validation via REST API in some versions — fall back to `text` type if needed.

#### Field set modifiers (for create/update)

- `fieldName+` — append to number/select/relation/file
- `+fieldName` — prepend to select/relation/file
- `fieldName-` — subtract from number/select/relation/file
- `fieldName:autogenerate` — auto-generate from pattern (TextField)

### 3. JavaScript SDK (client-side)

**Pre-flight: ensure node and npm exist.** Install if missing:

```bash
command -v node &>/dev/null || installPackage nodejs
command -v npm  &>/dev/null || installPackage npm
```

Install and initialize:

```bash
npm install pocketbase
```

```javascript
import PocketBase from 'pocketbase';

const pocketbaseClient = new PocketBase('http://127.0.0.1:8090');

// Optional: disable auto-cancellation for concurrent requests
pocketbaseClient.autoCancellation(false);
```

#### CRUD operations

```javascript
// List (paginated)
const paginatedPosts = await pocketbaseClient.collection('posts').getList(1, 50, {
    filter: 'created >= "2022-01-01 00:00:00" && status != archived',
    sort: '-created',
    expand: 'author,comments.user',
});

// Full list (no pagination)
const allPosts = await pocketbaseClient.collection('posts').getFullList({
    sort: '-created',
});

// Get first matching
const firstPost = await pocketbaseClient.collection('posts').getFirstListItem('status="published"');

// Get one by ID
const postById = await pocketbaseClient.collection('posts').getOne('recordId', {
    expand: 'author',
});

// Create
const createdPost = await pocketbaseClient.collection('posts').create({
    title: 'Lorem ipsum',
});

// Update
const updatedPost = await pocketbaseClient.collection('posts').update('recordId', {
    title: 'Updated',
});

// Delete
await pocketbaseClient.collection('posts').delete('recordId');
```

#### Batch operations (enable in Dashboard > Settings > Application)

```javascript
const batchRequest = pocketbaseClient.createBatch();

batchRequest.collection('posts').create({ ... });
batchRequest.collection('posts').update('recordId', { ... });
batchRequest.collection('posts').delete('recordId');
batchRequest.collection('comments').upsert({ ... });

const batchResult = await batchRequest.send();
```

#### File uploads (multipart/form-data)

```javascript
const formData = new FormData();
formData.append('title', 'My Post');
formData.append('document', new File([...], 'file.txt'));

const uploadedRecord = await pocketbaseClient.collection('posts').create(formData);
```

### 4. Authentication

```javascript
// Password auth
const authResult = await pocketbaseClient.collection('users').authWithPassword('email', 'password');

// Auth state
console.log(pocketbaseClient.authStore.isValid);
console.log(pocketbaseClient.authStore.token);
console.log(pocketbaseClient.authStore.record.id);

// Refresh token
await pocketbaseClient.collection('users').authRefresh();

// Logout
pocketbaseClient.authStore.clear();

// OTP auth
const otpRequest = await pocketbaseClient.collection('users').requestOTP('email');
const otpAuthResult = await pocketbaseClient.collection('users').authWithOTP(otpRequest.otpId, 'OTP_CODE');

// OAuth2
const oauthAuthResult = await pocketbaseClient.collection('users').authWithOAuth2Code(
    'google', 'CODE', 'VERIFIER', 'REDIRECT_URL',
    { name: 'test' } // optional create data
);

// Password reset
await pocketbaseClient.collection('users').requestPasswordReset('email');
await pocketbaseClient.collection('users').confirmPasswordReset('TOKEN', 'NEW_PASS', 'NEW_PASS');

// Email verification
await pocketbaseClient.collection('users').requestVerification('email');
await pocketbaseClient.collection('users').confirmVerification('TOKEN');

// Email change
await pocketbaseClient.collection('users').requestEmailChange('new@email.com');
await pocketbaseClient.collection('users').confirmEmailChange('TOKEN', 'PASSWORD');
```

### 5. Realtime subscriptions

Realtime uses Server-Sent Events (SSE). Events fire on `create`, `update`, `delete` operations.

- Subscribing to a **single record** checks the collection's `viewRule` for access.
- Subscribing to an **entire collection** checks the collection's `listRule` for access.
- If no messages received for 5 minutes, the server sends a disconnect signal (auto-reconnects if client is active).
- Auth happens during the `subscribe()` call (not during SSE connect).

```javascript
// Subscribe to all records in a collection
pocketbaseClient.collection('posts').subscribe('*', (realtimeEvent) => {
    console.log(realtimeEvent.action); // create|update|delete
    console.log(realtimeEvent.record);
}, { /* filter, expand, fields, headers */ });

// Subscribe to a single record
pocketbaseClient.collection('posts').subscribe('recordId', (realtimeEvent) => { ... });

// Unsubscribe
pocketbaseClient.collection('posts').unsubscribe('recordId'); // specific record
pocketbaseClient.collection('posts').unsubscribe('*');          // all '*' subscriptions
pocketbaseClient.collection('posts').unsubscribe();             // all in collection
```

### 6. API rules and filters

Access control is defined per collection via API rules (`listRule`, `viewRule`, `createRule`, `updateRule`, `deleteRule`). Auth collections also have `manageRule`.

Filter syntax:

**Comparison:**
```
field = "value"
field != "value"
field > 100
field >= 100
field < 100
field <= 100
```

**String matching:**
```
field ~ "pattern"
field !~ "pattern"
```

**Any/At-least-one-of (for arrays/multi-relations):**
```
field ?= "value"
field ?~ "pattern"
```

**Logical grouping:**
```
(expr1 && expr2) || expr3
```

Built-in auth variables for rules:
- `@request.auth.id` — authenticated user ID
- `@request.auth.role` — custom field access
- `@request.auth.collectionName` — auth collection name

Ownership pattern:
```
@request.auth.id != "" && author = @request.auth.id
```

Role pattern:
```
@request.auth.role = "admin"
```

### 7. API query parameters

Common parameters for list/search endpoints:

- `page` (Number) — page number (default 1)
- `perPage` (Number) — records per page (default 30)
- `sort` (String) — `+field` (ASC) or `-field` (DESC)
- `filter` (String) — filter expression
- `expand` (String) — relation expansion (up to 6 levels)
- `fields` (String) — comma-separated fields to return
- `skipTotal` (Boolean) — skip total count query (faster)

### 8. Superuser client (server-side)

For server-side operations requiring elevated access:

```javascript
import PocketBase from 'pocketbase';

const superuserClient = new PocketBase('https://example.com');
superuserClient.autoCancellation(false);

// Option 1: auth with credentials
await superuserClient.collection('_superusers').authWithPassword(superuserEmail, superuserPassword, {
    autoRefreshThreshold: 30 * 60
});

// Option 2: API key token
superuserClient.authStore.save('YOUR_GENERATED_SUPERUSER_TOKEN');

export default superuserClient;
```

## Guardrails

- **Client-side SPA recommended.** PocketBase is designed for direct client-to-API communication. Avoid JS SSR meta-frameworks (Nuxt, Next.js, SvelteKit) unless you understand the trade-offs.
- **No htmx/Turbo/Unpoly.** PocketBase's JSON API and stateless design don't play well with SSR-first tools.
- **`pb_data` in `.gitignore`.** Application data and uploads should not be committed.
- **`pb_migrations` in repo.** Migration files are safe to commit and should be version-controlled.
- **Date format is RFC3339.** Always use `Y-m-d H:i:s.uZ` format for date comparisons in filters.
- **Fields are non-nullable.** All fields (except JSONField) use zero-default when missing.
- **Batch requests need explicit enable.** Toggle in Dashboard > Settings > Application.
- **Realtime needs EventSource.** For React Native, install `react-native-sse` polyfill.
- **OAuth2 needs PKCE.** Use `authWithOAuth2Code` with code verifier/challenge.
- **Filter by `@collection.*` requires superuser.** Regular users cannot filter across collections.
