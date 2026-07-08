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

- [x] Create `foods` collection (name, calories, protein, carbs, fat, fiber, vitamins)
- [x] Create `meal_entries` collection (date, time, meal type, notes)
- [x] Create `meal_items` collection (food → meal_entry link, quantity_grams)
- [x] Import TACO CSV data into `foods` collection

---

## Epic 3: Basic Meal Logging UI

**Goal:** A form to manually log meals by selecting foods and entering quantities.

- [x] Create a Quasar layout with header, drawer, and main content area
- [x] Build `MealEntryForm` component (date, time, meal type selector)
- [x] Build `FoodSelector` component (search/autocomplete from `foods` collection)
- [x] Build `MealItemRow` component (food + quantity in grams + calculated totals)
- [x] Wire form submission to PocketBase API to create `meal_entry` + `meal_items`

---

## Epic 4: Automatic Nutrition Calculation

**Goal:** Real-time calorie and macro totals as the user adds foods to a meal.

- [x] Compute per-item nutrition from `foods` table × quantity_grams
- [x] Display running totals (calories, protein, carbs, fat, fiber) in the form
- [x] Show per-item breakdown in the meal item list
- [x] Persist calculated totals on the `meal_entry` record for fast queries

---

## Epic 5: Meal History & Daily View

**Goal:** View past meals grouped by date with nutrition summaries.

- [x] Create `MealHistory` page with date picker and list of entries
- [x] Group entries by date, show daily totals (calories, macros)
- [x] Allow editing an existing meal entry (reuse MealEntryForm)
- [x] Allow deleting a meal entry with confirmation dialog

---

## Epic 6: Environment Variables & Config

**Goal:** API keys and secrets managed outside source code.

> **Why keep this epic?** Even though the app has no user auth, students should learn the basics of security: secrets never belong in source code. This epic teaches `.env` patterns and `gitignore` hygiene — habits that matter in any real project.

- [x] Create `pocketbase/.env.example` with `OPENCODE_GO_API_KEY=` placeholder
- [x] Load env vars in PocketBase hooks via `$os.getenv()`
- [x] Document env setup in README and dev notes
- [x] Ensure `.env` is gitignored

---

## Epic 7: Weekly & Monthly Charts

**Goal:** ApexCharts time-series graphs for calorie and macro trends.

- [x] Install ApexCharts dependency in Quasar project
- [x] Build `NutritionChart` component (line/area chart for calories over time)
- [x] Add weekly view (last 7 days) with daily breakdown
- [x] Add monthly view (last 30 days) with daily breakdown
- [x] Add macro toggle (protein, carbs, fat) on the same chart

---

## Epic 8: Photo-Based Meal Registration

**Goal:** Snap a photo of a meal and auto-generate structured entries.

- [x] Build `PhotoUpload` component (camera capture or file picker)
- [x] Create PocketBase JS hook to call Mimo V2.5 via OpenCode Go with the image
- [x] Build prompt template that identifies foods and estimates portions from a photo
- [x] Map recognized foods to `foods` collection entries
- [x] Integrate photo recognition into AddMealModal with MANUAL/FOTO tabs
- [x] Populate MealEntryForm with recognized results for user review before saving
- [x] Allow adding multiple foods manually in the Manual tab (matching photo tab behavior)
- [x] Limit manual food list to 5 items per meal
- [x] Make food search accent-insensitive (feijão matches feijao)

---

## Dependency Graph

```
Epic 1 (Bootstrap)
  └─▶ Epic 2 (Schema)
        └─▶ Epic 3 (Meal Logging UI)
              └─▶ Epic 4 (Nutrition Calc)
              └─▶ Epic 5 (Meal History)
              └─▶ Epic 6 (Env Vars)
              └─▶ Epic 7 (Charts)
              └─▶ Epic 8 (Photo)
```

Epics 4–8 can be parallelized after Epic 3 is merged.
