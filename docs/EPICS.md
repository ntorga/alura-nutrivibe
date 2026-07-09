# NutriVibe — Epic Breakdown

## Methodology

This document breaks the NutriVibe project into the **smallest possible epics**. Each epic:

- Contains **3–4 tasks maximum**
- Should be **completable in one day** of professional work
- Results in a **short-lived PR** (merge early, merge often)
- Is **independently testable** and delivers incremental value

The goal is to go from **total greenfield to a finished product** through a series of small, reviewable steps. Each epic builds on the previous one, but no epic should block the entire team if it takes longer than expected.

### How to use this file

- Work through epics **in order** (later epics depend on earlier ones)
- Each epic becomes **one PR**
- Check off tasks as they are completed
- If an epic grows beyond one day, split it further

### PocketBase Collection Reference

These are the actual collection names and field names in the database. Use these exact names in API calls — PocketBase URLs are case-sensitive and use the collection name as-is.

**`foods`** — TACO food nutrition data (597 entries, seeded from CSV)

| Field | Type | Description |
|---|---|---|
| `description` | text | Food name in Portuguese (e.g. "Arroz, integral, cozido") |
| `category` | text | Food category (e.g. "Cereais e derivados") |
| `energy_kcal` | number | Calories per 100g |
| `protein_g` | number | Protein in grams per 100g |
| `carbohydrate_g` | number | Carbohydrates in grams per 100g |
| `lipid_g` | number | Fat in grams per 100g |
| `fiber_g` | number | Fiber in grams per 100g |
| `taco_id` | number | Original TACO database ID |

Plus vitamin/mineral fields (calcium_mg, iron_mg, sodium_mg, etc.) — not used in the UI but present in the data.

**`meal_entries`** — Flat schema: one record = one food in one meal. No separate `meal_items` collection.

| Field | Type | Description |
|---|---|---|
| `food` | relation → `foods` | Which food was eaten |
| `quantity_g` | number | Portion size in grams |
| `meal_type` | text | Meal type in Portuguese: `Café da manhã`, `Almoço`, `Jantar`, `Lanche` |
| `consumed_at` | date | When the meal was eaten (ISO date string) |
| `energy_kcal` | number | Calculated: `foods.energy_kcal × quantity_g / 100` |
| `protein_g` | number | Calculated: `foods.protein_g × quantity_g / 100` |
| `carbohydrate_g` | number | Calculated: `foods.carbohydrate_g × quantity_g / 100` |
| `lipid_g` | number | Calculated: `foods.lipid_g × quantity_g / 100` |
| `fiber_g` | number | Calculated: `foods.fiber_g × quantity_g / 100` |

**PocketBase API base URL:** `http://127.0.0.1:8090`

**List records:** `GET /api/collections/{collection}/records`
**Create record:** `POST /api/collections/{collection}/records`
**Update record:** `PATCH /api/collections/{collection}/records/{id}`
**Delete record:** `DELETE /api/collections/{collection}/records/{id}`

**Filter examples:**
- Foods by description (accent-insensitive): `?filter=description ~ 'arroz'`
- Meal entries by date: `?filter=consumed_at >= '2026-07-01' && consumed_at < '2026-07-02'`
- Expand food relation: `?expand=food`

---

## Epic 1: Project Bootstrap

**Goal:** Quasar SPA and PocketBase running locally with a health-check page.

- [x] Initialize Quasar project in `src/` with Vue 3 + Vite
- [x] Initialize PocketBase in `pocketbase/` and verify it starts
- [x] Configure Quasar to build into `pocketbase/pb_public/`
- [x] Serve a static "NutriVibe" landing page from PocketBase

---

## Epic 2: PocketBase Schema — Meals & Foods

**Goal:** Database collections for food items and meal entries, seeded with TACO data.

> **Schema note:** The design uses a **flat** `meal_entries` collection — each record represents one food in one meal. There is no `meal_items` join table. Calculated nutrition fields (`energy_kcal`, `protein_g`, etc.) are stored directly on `meal_entries` for fast aggregation queries.

- [x] Create `foods` collection with TACO field names (`description`, `category`, `energy_kcal`, `protein_g`, `carbohydrate_g`, `lipid_g`, `fiber_g`, `taco_id`)
- [x] Create `meal_entries` collection with `food` (relation → foods), `quantity_g`, `meal_type`, `consumed_at`, and calculated nutrition fields (`energy_kcal`, `protein_g`, `carbohydrate_g`, `lipid_g`, `fiber_g`)
- [x] Import TACO CSV data into `foods` collection (597 foods)

---

## Epic 3: Basic Meal Logging UI

**Goal:** A form to manually log meals by selecting foods and entering quantities.

- [x] Create a Quasar layout with header ("NutriVibe") and bottom navigation tabs: **HOJE** (today), **HISTÓRICO** (history), **GRÁFICOS** (charts)
- [x] Build `AddMealModal` dialog (triggered by floating action button) with meal type dropdown and food search
- [x] Build `FoodSelector` — search input with debounced autocomplete against `foods` collection. Search should be **accent-insensitive** (typing "feijao" matches "feijão"). Limit dropdown to 5 visible items with scroll. Hide dropdown after selecting an item.
- [x] Build meal item rows showing food description, quantity input (grams), and per-item calculated nutrition
- [x] Wire form submission to PocketBase API: for each food in the meal, create one `meal_entries` record with `food` relation, `quantity_g`, `meal_type`, `consumed_at`, and pre-calculated nutrition fields
- [x] Use Portuguese meal type values: `Café da manhã`, `Almoço`, `Jantar`, `Lanche`

---

## Epic 4: Automatic Nutrition Calculation

**Goal:** Real-time calorie and macro totals as the user adds foods to a meal.

- [x] Compute per-item nutrition using the formula: `food_field × quantity_g / 100` (e.g. `energy_kcal = foods.energy_kcal × quantity_g / 100`)
- [x] Display running totals (calories, protein, carbs, fat, fiber) in the modal footer, updating as items are added/removed/edited
- [x] Show per-item breakdown in the meal item list (each row shows its own calories and macros)
- [x] Persist calculated totals on each `meal_entries` record at save time (do not rely on client-side calculation for stored data — recompute server-side or in the hook)

---

## Epic 5: Meal History & Daily View

**Goal:** View past meals grouped by date with nutrition summaries.

- [ ] Create `MealHistoryPage` accessible from the HISTÓRICO bottom nav tab
- [ ] Date navigation: previous/next day chevrons + date input, default to today
- [ ] Query `meal_entries` filtered by `consumed_at` date range, expand `food` relation to get descriptions
- [ ] Group entries by `meal_type`, show daily totals (sum of energy_kcal, protein_g, carbohydrate_g, lipid_g, fiber_g)
- [ ] Allow editing an existing meal entry — open `AddMealModal` pre-filled with the entry's data
- [ ] Allow deleting a meal entry with Quasar confirmation dialog

---

## Epic 6: Environment Variables & Config

**Goal:** API keys and secrets managed outside source code.

> **Why keep this epic?** Even though the app has no user auth, students should learn the basics of security: secrets never belong in source code. This epic teaches `.env` patterns and `gitignore` hygiene — habits that matter in any real project.

- [ ] Create `pocketbase/.env.example` with `OPENCODE_GO_API_KEY=` placeholder
- [ ] Load env vars in PocketBase hooks via `$os.getenv()`
- [ ] Document env setup in README and dev notes
- [ ] Ensure `.env` is gitignored

---

## Epic 7: Weekly & Monthly Charts

**Goal:** ApexCharts time-series graphs for calorie and macro trends.

- [ ] Install ApexCharts (`apexcharts`) and Vue wrapper (`vue3-apexcharts`) in Quasar project
- [ ] Create `boot/apexcharts.js` to register the Vue plugin
- [ ] Build `NutritionChart` component using ApexCharts area chart
- [ ] Add **SEMANA** (last 7 days) and **MÊS** (last 30 days) toggle buttons
- [ ] Query `meal_entries` grouped by date, sum nutrition fields per day
- [ ] Add macro toggle buttons: **CALORIAS**, **PROTEÍNA**, **CARBOS**, **GORDURA** — clicking switches the chart's y-axis data series
- [ ] X-axis shows dates, Y-axis shows the selected metric value

---

## Epic 8: Photo-Based Meal Registration

**Goal:** Snap a photo of a meal and auto-generate structured entries.

- [ ] Build `PhotoUpload` component with two options: **TIRAR FOTO** (camera capture via `navigator.mediaDevices`) and **ESCOLHER IMAGEM** (file picker)
- [ ] Add MANUAL/FOTO tabs to `AddMealModal` — MANUAL shows the food search form, FOTO shows the photo upload
- [ ] Photo flow: user captures/selects image → frontend sends image to `POST /api/meals/parse` (multipart form data) → PocketBase JS hook (`pb_hooks/meal-parser.pb.js`) calls Mimo V2.5 via OpenCode Go → hook returns structured JSON with recognized foods and estimated portions → frontend populates the meal item list with the results for user review before saving
- [ ] Map recognized food names to `foods` collection entries via description search (accent-insensitive)
- [ ] Allow adding multiple foods manually in the MANUAL tab (same item row behavior as FOTO results)
- [ ] Limit manual food list to 5 items per meal
- [ ] Add delete button (×) to each manual item row
- [ ] Add CANCELAR button to deselect/clear a selected food before adding it to the list

---

## Dependency Graph

```
Epic 1 (Bootstrap)
  └─▶ Epic 2 (Schema)
        └─▶ Epic 3 (Meal Logging UI)
              ─▶ Epic 4 (Nutrition Calc)
              └─▶ Epic 5 (Meal History)
              ─▶ Epic 6 (Env Vars)
              └─▶ Epic 7 (Charts)
              └─▶ Epic 8 (Photo)
```

Epics 4–8 can be parallelized after Epic 3 is merged.
