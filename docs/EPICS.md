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

- [ ] Initialize Quasar project in `src/` with Vue 3 + Vite
- [ ] Initialize PocketBase in `pocketbase/` and verify it starts
- [ ] Configure Quasar to build into `pocketbase/pb_public/`
- [ ] Serve a static "NutriVibe" landing page from PocketBase

---

## Epic 2: PocketBase Schema — Meals & Foods

**Goal:** Database collections for food items and meal entries, seeded with TACO data.

- [ ] Create `foods` collection (name, calories, protein, carbs, fat, fiber, vitamins)
- [ ] Create `meal_entries` collection (date, time, meal type, notes)
- [ ] Create `meal_items` collection (food → meal_entry link, quantity_grams)
- [ ] Import TACO CSV data into `foods` collection

---

## Epic 3: Basic Meal Logging UI

**Goal:** A form to manually log meals by selecting foods and entering quantities.

- [ ] Create a Quasar layout with header, drawer, and main content area
- [ ] Build `MealEntryForm` component (date, time, meal type selector)
- [ ] Build `FoodSelector` component (search/autocomplete from `foods` collection)
- [ ] Build `MealItemRow` component (food + quantity in grams + calculated totals)
- [ ] Wire form submission to PocketBase API to create `meal_entry` + `meal_items`

---

## Epic 4: Automatic Nutrition Calculation

**Goal:** Real-time calorie and macro totals as the user adds foods to a meal.

- [ ] Compute per-item nutrition from `foods` table × quantity_grams
- [ ] Display running totals (calories, protein, carbs, fat, fiber) in the form
- [ ] Show per-item breakdown in the meal item list
- [ ] Persist calculated totals on the `meal_entry` record for fast queries

---

## Epic 5: Meal History & Daily View

**Goal:** View past meals grouped by date with nutrition summaries.

- [ ] Create `MealHistory` page with date picker and list of entries
- [ ] Group entries by date, show daily totals (calories, macros)
- [ ] Allow editing an existing meal entry (reuse MealEntryForm)
- [ ] Allow deleting a meal entry with confirmation dialog

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

- [ ] Install ApexCharts dependency in Quasar project
- [ ] Build `NutritionChart` component (line/area chart for calories over time)
- [ ] Add weekly view (last 7 days) with daily breakdown
- [ ] Add monthly view (last 30 days) with daily breakdown
- [ ] Add macro toggle (protein, carbs, fat) on the same chart

---

## Epic 8: Photo-Based Meal Registration

**Goal:** Snap a photo of a meal and auto-generate structured entries.

- [ ] Build `PhotoUpload` component (camera capture or file picker)
- [ ] Create PocketBase JS hook to call Mimo V2.5 via OpenCode Go with the image
- [ ] Build prompt template that identifies foods and estimates portions from a photo
- [ ] Map recognized foods to `foods` collection entries
- [ ] Populate MealEntryForm with recognized results for user review before saving

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
