---
shortDescription: "Vue.js 3 SPA framework with Material Design components, Quasar CLI, and Vite plugin"
version: "1.1.0"
lastUpdated: "2026-06-27"
allowed-tools:
  - Bash(quasar *)
  - Bash(npx quasar *)
  - Bash(pnpm *)
  - Bash(npm *)
---

## Purpose

Quasar is a Vue.js 3 framework for building SPAs, SSR apps, PWAs, mobile apps (Capacitor/Cordova), desktop apps (Electron), and browser extensions from a single codebase. It provides 70+ Material Design components, a CLI with Vite, and a plugin system. Use it to scaffold, develop, and deploy production-grade Vue applications with minimal configuration.

## Procedure

### 1. Project setup

Prerequisites: Node.js >=22 LTS, PNPM v11+ (or Yarn/NPM/Bun).

```bash
# Create project (interactive prompts)
pnpm create quasar@latest

# Install global CLI (optional but recommended)
pnpm add -g @quasar/cli
```

When prompted, select:
- **Quasar CLI with Vite** (not Webpack — deprecated)
- **SPA** mode (default for web apps)
- **Vue Router** for routing
- **Pinia** for state management
- **ESLint/Prettier** for linting (optional)

### 2. Project structure (Quasar CLI with Vite)

```
├── public/                    # Static assets (copied as-is)
├── src/
│   ├── assets/                # Processed assets (images, fonts)
│   ├── boot/                  # Boot files (run before app mounts)
│   ├── components/            # Reusable Vue components
│   ├── css/                   # Global styles, Quasar variables
│   │   └── quasar-variables.sass
│   ├── layouts/               # Layout components (header, drawer, footer)
│   ├── pages/                 # Page components (auto-routed)
│   ├── router/                # Vue Router configuration
│   │   └── routes.js
│   ├── stores/                # Pinia stores
│   └── App.vue                # Root component
├── index.html                 # Entry HTML
└── quasar.config.js           # Quasar configuration
```

### 3. Development commands

```bash
# Dev server
quasar dev           # or: pnpm quasar dev

# Build for production
quasar build         # SPA build

# Other build modes
quasar build -m pwa
quasar build -m capacitor -T android
quasar build -m electron
```

### 4. Routing (Vue Router)

Routes are defined in `src/router/routes.js`:

```javascript
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'about', component: () => import('pages/AboutPage.vue') },
      { path: 'users/:id', component: () => import('pages/UserPage.vue') },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
```

Navigate programmatically:

```javascript
import { useRouter } from 'vue-router';

const router = useRouter();
router.push('/about');
router.push({ name: 'user', params: { id: 42 } });
```

### 5. Layouts and pages

**Layout** (`src/layouts/MainLayout.vue`):

```vue
<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="toggleDrawer" />
        <q-toolbar-title>My App</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>Navigation</q-item-label>
        <q-item clickable v-ripple to="/">
          <q-item-section avatar><q-icon name="home" /></q-item-section>
          <q-item-section>Home</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue';

const leftDrawerOpen = ref(false);
const toggleDrawer = () => { leftDrawerOpen.value = !leftDrawerOpen.value; };
</script>
```

**Page** (`src/pages/IndexPage.vue`):

```vue
<template>
  <q-page class="row items-center justify-center">
    <div class="text-h4">Welcome</div>
  </q-page>
</template>

<script setup>
// Page logic here
</script>
```

### 6. Key Quasar components

#### Forms

```vue
<template>
  <q-form @submit="onSubmit">
    <q-input v-model="form.name" label="Name" filled :rules="[val => !!val || 'Required']" />
    <q-input v-model="form.email" label="Email" type="email" filled />
    <q-select v-model="form.role" :options="['admin', 'user']" label="Role" filled />
    <q-toggle v-model="form.active" label="Active" />
    <q-btn type="submit" label="Save" color="primary" />
  </q-form>
</template>

<script setup>
import { reactive } from 'vue';

const form = reactive({ name: '', email: '', role: 'user', active: true });
const onSubmit = () => { /* handle submit */ };
</script>
```

#### Lists and tables

```vue
<template>
  <q-list bordered separator>
    <q-item v-for="item in items" :key="item.id" clickable v-ripple>
      <q-item-section avatar>
        <q-avatar color="primary" text-color="white">{{ item.name[0] }}</q-avatar>
      </q-item-section>
      <q-item-section>{{ item.name }}</q-item-section>
      <q-item-section side>
        <q-badge color="green" :label="item.status" />
      </q-item-section>
    </q-item>
  </q-list>
</template>
```

#### Data table (with pagination)

```vue
<template>
  <q-table
    :rows="rows"
    :columns="columns"
    row-key="id"
    v-model:pagination="pagination"
    @request="onRequest"
    :loading="loading"
  />
</template>

<script setup>
import { ref } from 'vue';

const columns = [
  { name: 'name', label: 'Name', field: 'name', sortable: true },
  { name: 'email', label: 'Email', field: 'email' },
];

const rows = ref([]);
const loading = ref(false);
const pagination = ref({ page: 1, rowsPerPage: 10, rowsNumber: 0 });

const onRequest = async (props) => {
  loading.value = true;
  // Fetch data with props.pagination
  loading.value = false;
};
</script>
```

### 7. Quasar plugins

Import in `quasar.config.js` or boot file:

```javascript
// quasar.config.js
framework: {
  plugins: ['Notify', 'Dialog', 'Loading', 'LocalStorage']
}
```

Usage:

```javascript
import { useQuasar } from 'quasar';

const $q = useQuasar();

$q.notify({ type: 'positive', message: 'Saved!' });
$q.notify({ type: 'negative', message: 'Error occurred' });

$q.dialog({
  title: 'Confirm',
  message: 'Are you sure?',
  cancel: true,
}).onOk(() => { /* confirmed */ });

$q.loading.show();
$q.loading.hide();
```

### 8. State management (Pinia)

Store definition (`src/stores/counter.js`):

```javascript
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  getters: { double: (state) => state.count * 2 },
  actions: {
    increment() { this.count++; },
    async fetchCount() {
      // API call
      this.count = await fetch('/api/count').then(r => r.json());
    },
  },
});
```

Usage in component:

```vue
<script setup>
import { useCounterStore } from 'stores/counter';
import { storeToRefs } from 'pinia';

const counter = useCounterStore();
const { count, double } = storeToRefs(counter);
</script>
```

### 9. Boot files

Boot files run before the root Vue instance is instantiated. Use for global plugins, interceptors, auth guards, or initialization.

#### Anatomy

```javascript
import { defineBoot } from '#q-app'

export default defineBoot(({ app, router, store }) => {
  // app   — Vue app instance
  // router — Vue Router instance
  // store  — Pinia instance (if using src/stores)
})
```

Boot files can also be async:

```javascript
import { defineBoot } from '#q-app'

export default defineBoot(async ({ app, router, store }) => {
  await something()
})
```

Code outside the default export runs immediately (imports, constants). Code inside has access to `app`, `router`, `store`.

#### Example: Axios boot file

```javascript
// src/boot/axios.js
import { defineBoot } from '#q-app'
import axios from 'axios'

const api = axios.create({ baseURL: 'http://127.0.0.1:8090' })

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios   // this.$axios (Options API)
  app.config.globalProperties.$api = api       // this.$api (Options API)
})

export { axios, api }  // named exports for use in any .js file
```

Then in any JS file: `import { api } from '@/boot/axios'`

#### Example: Router auth guard

```javascript
import { defineBoot } from '#q-app'

export default defineBoot(({ router, store }) => {
  router.beforeEach((to, from, next) => {
    // auth logic here
  })
})
```

#### Example: Redirect in boot

```javascript
import { defineBoot } from '#q-app'

export default defineBoot(({ urlPath, redirect }) => {
  const isAuthorized = /* ... */
  if (!isAuthorized && !urlPath.startsWith('/login')) {
    redirect({ path: '/login' })
    return  // must return after redirect
  }
})
```

#### SSR/client-only boot files

```javascript
// quasar.config.js
boot: [
  { server: false, path: 'client-only' },  // client-side only
  { client: false, path: 'server-only' },   // server-side only
]
```

#### Register in `quasar.config.js`

```javascript
boot: ['axios'],
```

Generate a boot file with CLI: `quasar new boot <name> [--format ts]`

#### Quasar App Flow (boot sequence)

1. Quasar initialized (components, directives, plugins, i18n, icon sets)
2. Quasar extras imported (Roboto font, icons, animations)
3. Quasar CSS & global CSS imported
4. App.vue loaded
5. Pinia injected (if using `src/stores`)
6. Router imported
7. Boot files imported
8. Router default export executed
9. Boot files default export executed
10. Vue instantiated with root component and attached to DOM

### 10. Component methods and refs

Access component methods via template refs:

```vue
<template>
  <q-table ref="tableRef" ... />
</template>

<script setup>
import { useTemplateRef, onMounted } from 'vue'

const tableRef = useTemplateRef('tableRef')

onMounted(() => {
  tableRef.value.refresh()  // call method on mounted
})
</script>
```

### 11. Plugin usage outside Vue files

```javascript
import { Notify } from 'quasar'

Notify.create('My message')
Notify.create({ type: 'positive', message: 'Saved!' })
```

### 12. Styling

**Quasar Sass variables** (`src/css/quasar-variables.sass`):

```sass
$primary   : #1976D2
$secondary : #26A69A
$accent    : #9C27B0
$dark      : #1D1D1D
$positive  : #21BA45
$negative  : #C10015
$info      : #31CCEC
$warning   : #F2C037
```

**Utility classes** (built-in):

```html
<div class="q-pa-md q-mt-lg">          <!-- padding/margin -->
<div class="row items-center justify-between">  <!-- flexbox -->
<div class="col-12 col-md-6">           <!-- grid columns -->
<div class="text-h4 text-primary">      <!-- typography + color -->
<div class="bg-grey-2 rounded-borders"> <!-- background + radius -->
```

**Dark mode**:

```vue
<script setup>
import { useQuasar } from 'quasar';
const $q = useQuasar();
$q.dark.set(true); // or 'auto'
</script>
```

### 11. Vite plugin (alternative to Quasar CLI)

For existing Vite projects:

```bash
pnpm add quasar @quasar/extras
pnpm add -D @quasar/vite-plugin sass-embedded@^1.93.2
```

`vite.config.js`:

```javascript
import { join } from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';

export default defineConfig({
  plugins: [
    vue({ template: { transformAssetUrls } }),
    quasar({
      sassVariables: join(import.meta.dirname, 'src/quasar-variables.sass'),
    }),
  ],
});
```

`main.js`:

```javascript
import { createApp } from 'vue';
import { Quasar } from 'quasar';
import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';
import App from './App.vue';

const app = createApp(App);
app.use(Quasar, { plugins: {} });
app.mount('#app');
```

## Guardrails

- **Use Quasar CLI with Vite, not Webpack.** Webpack CLI is deprecated.
- **SPA mode for web apps.** Use SSR/PWA/mobile modes only when needed — they add complexity.
- **Lazy-load pages.** Use `() => import('pages/...')` in routes for code splitting.
- **Boot files run once.** They execute before the app mounts, not on every route change.
- **`quasar.config.js` is the source of truth.** Framework plugins, boot files, and build options are configured here.
- **Use `q-table` for data.** It handles pagination, sorting, and filtering out of the box.
- **Pinia over Vuex.** Quasar recommends Pinia for state management.
- **Sass variables over CSS overrides.** Use `quasar-variables.sass` for theming, not `!important`.
- **Don't mix Quasar CLI and Vite plugin.** Pick one approach and stick with it.
- **Node.js LTS only.** Non-LTS versions may cause issues with Quasar CLI.
- **Use `defineBoot` from `#q-app`.** The old `boot` from `quasar/wrappers` is still supported but `defineBoot` provides better IDE autocomplete.
- **Self-closing tags are valid.** `<q-icon name="cloud" />` is equivalent to `<q-icon name="cloud"></q-icon>`.
- **Return after `redirect()`.** In boot files, always `return` immediately after calling `redirect()`.
- **Use Composition API with `<script setup>`.** Quasar recommends this over Options API.
- **Component methods need refs.** Use `useTemplateRef()` to access component methods; call after mount.
