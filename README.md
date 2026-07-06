# NutriVibe

A nutrition tracker SPA built with [PocketBase](https://pocketbase.io/) and [Quasar](https://quasar.dev/).

This project was built for an **Alura workshop** where students learn to set up their development environment and then use [OpenCode](https://opencode.ai) to build the entire application from scratch — the agent and the user collaboratively plan every step before the agent implements it.

## Features

- Photo-based meal registration — snap a photo of your meal and [Mimo V2.5](https://platform.mimo.ai/) transforms it into structured form entries
- Log meals throughout the day with detailed food entries
- Automatic nutrition calculation (calories, macros, vitamins, minerals)
- Weekly and monthly graphs for tracking progress over time (powered by [ApexCharts](https://apexcharts.com/))

The AI feature is powered by [OpenCode Go](https://opencode.ai/docs/go/), an AI subscription service that provides access to multiple models.

## Tech Stack

- **Frontend:** Quasar (Vue.js)
- **Charts:** ApexCharts.js
- **Backend:** PocketBase
- **Database:** PocketBase (SQLite)
- **Food Data:** [TACO](https://www.nepa.unicamp.br/taco/tabela.php) — 597 Brazilian foods
- **AI:** OpenCode Go (Mimo V2.5 for image recognition)

## Project Structure

- `src/` — Quasar source code (Vue.js SPA)
- `pocketbase/` — PocketBase binary, data, migrations, hooks, and built frontend (gitignored, created during setup)
  - `pocketbase/pb_public/` — built frontend assets (output of `quasar build`, served by PocketBase at `http://127.0.0.1:8090`)
- `assets/` — static data files (TACO food database)
- `docs/` — project documentation

Build workflow: `cd src && quasar build` (outputs directly to `pocketbase/pb_public/`) → PocketBase serves the SPA and API from a single binary.

## Workshop

The workshop runs 12 hours across 4 lessons. See the [Lesson Plan](docs/LESSON-PLAN.md) for the full breakdown.

### PocketBase Superuser

- **Email:** `admin@nutrivibe.local`
- **Password:** `NutriVibe2026!`

## Documentation

- [Lesson Plan](docs/LESSON-PLAN.md) — workshop structure, setup steps, and lesson topics
- [Epics](docs/EPICS.md) — project broken into small, independently deliverable increments
- [Food Nutrition Database](docs/FOOD-NUTRITION-DB.md) — offline Brazilian food data and query examples
- [Meal Parser Strategy](docs/MEAL-PARSER-STRATEGY.md) — architecture and implementation plan for photo-to-structured-form parsing
- [Development Notes](docs/DEVELOPMENT-NOTES.md) — technical decisions, gotchas, and setup details

## Scope

This is a **workshop project** — there is no user authentication. PocketBase ships with built-in user management, and wiring it into the Quasar frontend would take minimal effort. We chose to skip it so the workshop could focus its limited time on what matters most: building the AI-powered features that define the product.

## TODO

Features not yet implemented:

- **Photo-based meal registration** — Integrate Mimo V2.5 via OpenCode Go to recognize foods from a camera/photo. Requires a file upload component and an API call to the image recognition model.
- **Weekly and monthly nutrition graphs** — Use ApexCharts.js to render time-series charts of calorie/macro intake. Load data from `meal_entries` grouped by date.
- **Environment variables** — Add `pocketbase/.env.example` with `OPENCODE_GO_API_KEY=` placeholder. The AI API key is used server-side in PocketBase hooks (never exposed to the browser). Set via system env var or `.env` file in the `pocketbase/` directory, accessed via `$os.getenv("OPENCODE_GO_API_KEY")`.

## Agents

The `.agents/` directory was committed for convenience but should be added to `.gitignore` in forks. See [AGENTS.md](AGENTS.md) for details.
