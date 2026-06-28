# NutriVibe

A nutrition tracker SPA built with [PocketBase](https://pocketbase.io/) and [Quasar](https://quasar.dev/).

This project was built for an **Alura workshop** where students learn to set up their development environment and then use [OpenCode](https://opencode.ai) to build the entire application from scratch — the agent and the user collaboratively plan every step before the agent implements it.

## Features

- Natural language meal logging — type what you ate in plain language (e.g., "almorcei arroz com feijão e frango grelhado ontem às 12h") and [DeepSeek V4 Flash](https://api-docs.deepseek.com/) parses it into structured form entries
- Photo-based meal registration — snap a photo of your meal and [Mimo V2.5](https://platform.mimo.ai/) transforms it into structured form entries
- Log meals throughout the day with detailed food entries
- Automatic nutrition calculation (calories, macros, vitamins, minerals)
- Weekly and monthly graphs for tracking progress over time

Both AI features are powered by [OpenCode Go](https://opencode.ai/docs/go/), an AI subscription service that provides access to multiple models.

## Tech Stack

- **Frontend:** Quasar (Vue.js)
- **Backend:** PocketBase
- **Database:** PocketBase (SQLite)
- **Food Data:** [TACO](https://www.nepa.unicamp.br/taco/tabela.php) — 597 Brazilian foods
- **AI:** OpenCode Go (DeepSeek V4 Flash for text, Mimo V2.5 for image recognition)

## Workshop Setup

The workshop runs 12 hours and covers the full environment setup before building:

1. **WSL install** (Windows students) — Linux subsystem for running the dev toolchain
2. **Node.js via [mise](https://mise.jdx.dev/)** — polyglot version manager for Node.js and other runtimes
3. **OpenCode install via npm** — `npm install -g opencode-ai`
4. **OpenCode Go setup** — subscribe at [opencode.ai/go](https://opencode.ai/docs/go/) and configure the API key
5. **Collaborative planning** — user and agent discuss the full project plan via conversation
6. **Agent-driven build** — OpenCode builds the project step by step from the agreed plan

### PocketBase Superuser

- **Email:** `admin@nutrivibe.local`
- **Password:** `NutriVibe2026!`

## Documentation

- [Food Nutrition Database](docs/food-nutrition-db.md) — offline Brazilian food data and query examples

## Agents

The `.agents/` directory was committed for convenience but should be added to `.gitignore` in forks. See [AGENTS.md](AGENTS.md) for details.
