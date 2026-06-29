# NutriVibe

A nutrition tracker SPA built with [PocketBase](https://pocketbase.io/) and [Quasar](https://quasar.dev/).

This project was built for an **Alura workshop** where students learn to set up their development environment and then use [OpenCode](https://opencode.ai) to build the entire application from scratch — the agent and the user collaboratively plan every step before the agent implements it.

## Features

- Natural language meal logging — type what you ate in plain language (e.g., "almorcei arroz com feijão e frango grelhado ontem às 12h") and [DeepSeek V4 Flash](https://api-docs.deepseek.com/) parses it into structured form entries
- Photo-based meal registration — snap a photo of your meal and [Mimo V2.5](https://platform.mimo.ai/) transforms it into structured form entries
- Log meals throughout the day with detailed food entries
- Automatic nutrition calculation (calories, macros, vitamins, minerals)
- Weekly and monthly graphs for tracking progress over time (powered by [ApexCharts](https://apexcharts.com/))

Both AI features are powered by [OpenCode Go](https://opencode.ai/docs/go/), an AI subscription service that provides access to multiple models.

## Tech Stack

- **Frontend:** Quasar (Vue.js)
- **Charts:** ApexCharts.js
- **Backend:** PocketBase
- **Database:** PocketBase (SQLite)
- **Food Data:** [TACO](https://www.nepa.unicamp.br/taco/tabela.php) — 597 Brazilian foods
- **AI:** OpenCode Go (DeepSeek V4 Flash for text, Mimo V2.5 for image recognition)

## Project Structure

- `src/` — Quasar source code (Vue.js SPA)
- `pocketbase/` — PocketBase binary, data, migrations, hooks, and built frontend (gitignored, created during setup)
  - `pocketbase/pb_public/` — built frontend assets (output of `quasar build`, served by PocketBase at `http://127.0.0.1:8090`)
- `assets/` — static data files (TACO food database)
- `docs/` — project documentation

Build workflow: `cd src && quasar build` (outputs directly to `pocketbase/pb_public/`) → PocketBase serves the SPA and API from a single binary.

## Workshop Setup

The workshop runs 12 hours and covers the full environment setup before building:

1. **WSL install** (Windows students) — Linux subsystem for running the dev toolchain
2. **Node.js via [mise](https://mise.jdx.dev/)** — polyglot version manager for Node.js and other runtimes
3. **[Zed](https://zed.dev/) install** — high-performance code editor
4. **OpenCode install via npm** — `npm install -g opencode-ai`, runs inside Zed's built-in terminal
5. **OpenCode Go setup** — subscribe at [opencode.ai/go](https://opencode.ai/docs/go/) and configure the API key
6. **Collaborative planning** — user and agent discuss the full project plan via conversation
7. **Agent-driven build** — OpenCode builds the project step by step from the agreed plan

### PocketBase Superuser

- **Email:** `admin@nutrivibe.local`
- **Password:** `NutriVibe2026!`

## Documentation

- [Food Nutrition Database](docs/food-nutrition-db.md) — offline Brazilian food data and query examples
- [Meal Parser Strategy](docs/meal-parser-strategy.md) — architecture and implementation plan for text/image-to-structured-form parsing (design phase, to be implemented as the final step after the rest of the project is complete)
- [Development Notes](docs/development-notes.md) — technical decisions, gotchas, and setup details

## TODO

Features not yet implemented:

- **Natural language meal logging** — Integrate DeepSeek V4 Flash via OpenCode Go to parse free-text meal descriptions (e.g., "almorcei arroz com feijão ontem às 12h") into structured food entries. Should use a PocketBase JS hook (`pb_hooks/`) to call the API server-side, or a frontend API call. See [Meal Parser Strategy](docs/meal-parser-strategy.md) for the design.
- **Photo-based meal registration** — Integrate Mimo V2.5 via OpenCode Go to recognize foods from a camera/photo. Requires a file upload component and an API call to the image recognition model.
- **Weekly and monthly nutrition graphs** — Use ApexCharts.js to render time-series charts of calorie/macro intake. Load data from `meal_entries` grouped by date.
- **Environment variables** — Add `pocketbase/.env.example` with `OPENCODE_GO_API_KEY=` placeholder. The AI API key is used server-side in PocketBase hooks (never exposed to the browser). Set via system env var or `.env` file in the `pocketbase/` directory, accessed via `$os.getenv("OPENCODE_GO_API_KEY")`.
- **User authentication** — The app currently has no user auth. All data is public. Add PocketBase `users` collection auth so each user sees only their own meal entries.

## Agents

The `.agents/` directory was committed for convenience but should be added to `.gitignore` in forks. See [AGENTS.md](AGENTS.md) for details.
