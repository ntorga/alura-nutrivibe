---
shortDescription: "Single-file Go backend with embedded SQLite, realtime subscriptions, auth, and REST API"
version: "1.1.0"
lastUpdated: "2026-06-27"
---

## Purpose

PocketBase is an open-source backend in a single Go binary. It provides an embedded SQLite database with realtime subscriptions, built-in auth management, a dashboard UI, and a REST-ish API. Use it to stand up a full backend without external services — just download the binary, run `./pocketbase serve`, and you have a working API server on `http://127.0.0.1:8090`.

## Procedure

### 1. Setup and installation

Download the prebuilt binary from [GitHub Releases](https://github.com/pocketbase/pocketbase/releases) or install via Go:

```bash
# Standalone binary (recommended for quick start)
# Download from https://github.com/pocketbase/pocketbase/releases
./pocketbase serve

# Or as Go framework
go get github.com/pocketbase/pocketbase
```

First run generates an installer link for the superuser account. Create manually if needed:

```bash
./pocketbase superuser create EMAIL PASS
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

| Type | Description | Default |
|------|-------------|---------|
| `BoolField` | `true`/`false` | `false` |
| `NumberField` | numeric/float64 | `0` |
| `TextField` | string | `""` |
| `EmailField` | email string | `""` |
| `URLField` | URL string | `""` |
| `EditorField` | HTML text | `""` |
| `DateField` | RFC3339 datetime (`Y-m-d H:i:s.uZ`) | `""` |
| `AutodateField` | auto-set on create/update | — |
| `SelectField` | single/multiple from predefined list | `""` or `[]` |
| `FileField` | file reference (stored on disk or S3) | `""` or `[]` |
| `RelationField` | reference to another collection record | `""` or `[]` |
| `JSONField` | any serialized JSON (nullable) | `null` |
| `GeoPoint` | `{lon, lat}` coordinates | `{lon:0, lat:0}` |

#### Field set modifiers (for create/update)

- `fieldName+` — append to number/select/relation/file
- `+fieldName` — prepend to select/relation/file
- `fieldName-` — subtract from number/select/relation/file
- `fieldName:autogenerate` — auto-generate from pattern (TextField)

### 3. JavaScript SDK (client-side)

Install and initialize:

```bash
npm install pocketbase
```

```javascript
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

// Optional: disable auto-cancellation for concurrent requests
pb.autoCancellation(false);
```

#### CRUD operations

```javascript
// List (paginated)
const resultList = await pb.collection('posts').getList(1, 50, {
    filter: 'created >= "2022-01-01 00:00:00" && someField1 != someField2',
    sort: '-created',
    expand: 'relField1,relField2.subRelField',
});

// Full list (no pagination)
const records = await pb.collection('posts').getFullList({
    sort: '-created',
});

// Get first matching
const record = await pb.collection('posts').getFirstListItem('someField="test"');

// Get one by ID
const one = await pb.collection('posts').getOne('RECORD_ID', {
    expand: 'relField1',
});

// Create
const newRecord = await pb.collection('demo').create({
    title: 'Lorem ipsum',
});

// Update
const updated = await pb.collection('demo').update('RECORD_ID', {
    title: 'Updated',
});

// Delete
await pb.collection('demo').delete('RECORD_ID');
```

#### Batch operations (enable in Dashboard > Settings > Application)

```javascript
const batch = pb.createBatch();

batch.collection('example1').create({ ... });
batch.collection('example2').update('RECORD_ID', { ... });
batch.collection('example3').delete('RECORD_ID');
batch.collection('example4').upsert({ ... });

const result = await batch.send();
```

#### File uploads (multipart/form-data)

```javascript
const data = new FormData();
data.append('title', 'My Post');
data.append('document', new File([...], 'file.txt'));

const record = await pb.collection('demo').create(data);
```

### 4. Authentication

```javascript
// Password auth
const authData = await pb.collection('users').authWithPassword('email', 'password');

// Auth state
console.log(pb.authStore.isValid);
console.log(pb.authStore.token);
console.log(pb.authStore.record.id);

// Refresh token
await pb.collection('users').authRefresh();

// Logout
pb.authStore.clear();

// OTP auth
const otpReq = await pb.collection('users').requestOTP('email');
const otpAuth = await pb.collection('users').authWithOTP(otpReq.otpId, 'OTP_CODE');

// OAuth2
const oauth = await pb.collection('users').authWithOAuth2Code(
    'google', 'CODE', 'VERIFIER', 'REDIRECT_URL',
    { name: 'test' } // optional create data
);

// Password reset
await pb.collection('users').requestPasswordReset('email');
await pb.collection('users').confirmPasswordReset('TOKEN', 'NEW_PASS', 'NEW_PASS');

// Email verification
await pb.collection('users').requestVerification('email');
await pb.collection('users').confirmVerification('TOKEN');

// Email change
await pb.collection('users').requestEmailChange('new@email.com');
await pb.collection('users').confirmEmailChange('TOKEN', 'PASSWORD');
```

### 5. Realtime subscriptions

Realtime uses Server-Sent Events (SSE). Events fire on `create`, `update`, `delete` operations.

- Subscribing to a **single record** checks the collection's `viewRule` for access.
- Subscribing to an **entire collection** checks the collection's `listRule` for access.
- If no messages received for 5 minutes, the server sends a disconnect signal (auto-reconnects if client is active).
- Auth happens during the `subscribe()` call (not during SSE connect).

```javascript
// Subscribe to all records in a collection
pb.collection('posts').subscribe('*', (e) => {
    console.log(e.action); // create|update|delete
    console.log(e.record);
}, { /* filter, expand, fields, headers */ });

// Subscribe to a single record
pb.collection('posts').subscribe('RECORD_ID', (e) => { ... });

// Unsubscribe
pb.collection('posts').unsubscribe('RECORD_ID'); // specific record
pb.collection('posts').unsubscribe('*');          // all '*' subscriptions
pb.collection('posts').unsubscribe();             // all in collection
```

### 6. API rules and filters

Access control is defined per collection via API rules (`listRule`, `viewRule`, `createRule`, `updateRule`, `deleteRule`). Auth collections also have `manageRule`.

Filter syntax:

```
// Comparison
field = "value"
field != "value"
field > 100
field >= 100
field < 100
field <= 100

// String matching
field ~ "pattern"       // LIKE (auto-wraps in %)
field !~ "pattern"      // NOT LIKE

// Any/At-least-one-of (for arrays/multi-relations)
field ?= "value"
field ?~ "pattern"

// Logical grouping
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

| Param | Type | Description |
|-------|------|-------------|
| `page` | Number | Page number (default 1) |
| `perPage` | Number | Records per page (default 30) |
| `sort` | String | `+field` (ASC) or `-field` (DESC) |
| `filter` | String | Filter expression |
| `expand` | String | Relation expansion (up to 6 levels) |
| `fields` | String | Comma-separated fields to return |
| `skipTotal` | Boolean | Skip total count query (faster) |

### 8. Superuser client (server-side)

For server-side operations requiring elevated access:

```javascript
import PocketBase from 'pocketbase';

const superuserClient = new PocketBase('https://example.com');
superuserClient.autoCancellation(false);

// Option 1: auth with credentials
await superuserClient.collection('_superusers').authWithPassword(EMAIL, PASS, {
    autoRefreshThreshold: 30 * 60
});

// Option 2: API key token
superuserClient.authStore.save('YOUR_GENERATED_SUPERUSER_TOKEN');

export default superuserClient;
```

### 9. Production deployment

#### Standalone binary (minimal)

```bash
# Upload binary + pb_migrations + pb_hooks to server
rsync -avz -e ssh /local/path/to/myapp root@SERVER_IP:/root/pb

# Start with auto TLS (Let's Encrypt)
/root/pb/pocketbase serve yourdomain.com
```

#### Systemd service (`/lib/systemd/system/pocketbase.service`)

```ini
[Unit]
Description = pocketbase

[Service]
Type             = simple
User             = root
Group            = root
LimitNOFILE      = 4096
Restart          = always
RestartSec       = 5s
StandardOutput   = append:/root/pb/std.log
StandardError    = append:/root/pb/std.log
WorkingDirectory = /root/pb
ExecStart        = /root/pb/pocketbase serve yourdomain.com

[Install]
WantedBy = multi-user.target
```

```bash
systemctl enable pocketbase.service
systemctl start pocketbase
```

#### Reverse proxy (NGINX)

```nginx
server {
    listen 80;
    server_name example.com;
    client_max_body_size 10M;

    location / {
        proxy_set_header Connection '';
        proxy_http_version 1.1;
        proxy_read_timeout 360s;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_pass http://127.0.0.1:8090;
    }
}
```

Set "User IP proxy headers" in Dashboard settings (`X-Real-IP`, `X-Forwarded-For`) so PocketBase logs the actual client IP.

#### Docker

```dockerfile
FROM alpine:latest
ARG PB_VERSION=0.39.4
RUN apk add --no-cache unzip ca-certificates
ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/
# COPY ./pb_migrations /pb/pb_migrations
# COPY ./pb_hooks /pb/pb_hooks
EXPOSE 8080
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080"]
```

Mount volume at `/pb/pb_data` for persistence.

#### Backup and restore

- Manual: copy/replace `pb_data` directory (stop app first for transactional safety).
- Built-in API: Dashboard > Settings > Backups (local or S3). Generates ZIP snapshot of `pb_data`.
- During backup generation, app is temporarily read-only.
- For large `pb_data` (2GB+), use `sqlite3 .backup` + `rsync` instead.

#### Production recommendations

| Setting | Description |
|---------|-------------|
| **SMTP mail** | Configure in Dashboard > Settings > Mail. Default `sendmail` is unreliable. |
| **Rate limiter** | Enable in Dashboard > Settings > Application. Prevents API abuse. |
| **Superuser IP whitelist** | Restrict superuser access to specific IPs (v0.38.0+). |
| **MFA for superusers** | Enable OTP for `_superusers` collection. |
| **`GOMEMLIMIT`** | Set env var (e.g. `GOMEMLIMIT=512MiB`) to prevent OOM in constrained environments. |
| **Settings encryption** | Use `--encryptionEnv=PB_ENCRYPTION_KEY` with a 32-char key to encrypt stored settings. |
| **Open file descriptors** | `ulimit -n 4096` or set `LimitNOFILE` in systemd for many realtime connections. |

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
- **`--scrape` on search costs 5 extra credits.** Prefer plain scrape to file, then search markdown yourself.
