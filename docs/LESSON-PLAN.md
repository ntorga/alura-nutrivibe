# NutriVibe — Workshop Lesson Plan

**Duration:** 4 lessons × 3 hours = 12 hours
**Format:** Instructor-led with hands-on exercises
**Goal:** Students learn to think before they build — then build with an agent

---

## Lesson 1: Setup + AI Fundamentals (3h)

> **This is AI Product Building, not Vibe Coding.** We won't have a working app by the end of today — and that's intentional. Product building means understanding the problem, choosing tools, and knowing what the agent produces. The first two lessons are heavy on learning. By Lesson 3, you'll be building the entire app because you'll understand every decision.

**WHY:** A chef needs sharp knives and to know how heat works. Today: tools and AI fundamentals.

**HOW:** Install everything bottom-up (OS → runtime → editor → agent), then learn to think like the agent.

**WHAT:**

- **Setup (70 min)** — verify after each step, raise hand if stuck
  - [Zed](https://zed.dev/) install
  - WSL install (Windows only) / verify terminal (Mac/Linux) - optional: `sudo apt update && sudo apt upgrade -y`
  - Node.js via [mise](https://mise.jdx.dev/) — `mise use -g node@lts` then update npm `npm -g install npm`
  - SFW install via npm — `npm install -g sfw`
  - OpenCode install via npm:
    - `sfw npm install -g opencode-ai`
    - `npm config set allow-scripts=opencode-ai --location=user`
    - `sfw npm install -g opencode-ai`
  - OpenCode Go setup — subscribe at [opencode.ai/go](https://opencode.ai/docs/go/)
    - `opencode auth login`
  - Install agent-browser — `sfw npm install -g agent-browser && agent-browser install`
  - Clone the project repository — `git clone https://github.com/ntorga/alura-nutrivibe.git`
  - Project skills — how to use `.agents/skills/` for domain-specific guidance. Reference a skill by typing `@` followed by the skill file path (e.g., `@.agents/skills/pocketbase.md`) in your prompt.
- **Q&A (10 min)** — setup issues, environment problems
- **AI fundamentals (65 min)**
  - What is a context window? How much can the agent "see"? (10 min)
  - How to prompt — be specific, give context, describe expected output. Includes model context: what OpenCode Go uses and why. Bad vs good prompt examples. (15 min)
  - How to research with AI — use the agent as a research tool, not just a code generator. (15 min)
  - How to make a plan — break a big goal into small, verifiable steps. (10 min)
  - How to debug agent output — identify the bug, describe it clearly, provide relevant context. (15 min)
- **Experiment (15 min)** — prompt the agent to extract structured data from a meal description. Try vague vs specific prompts, compare the output.
- **Agent-browser demo (5 min)** — quick walkthrough of how to verify UI with agent-browser
- **Buffer / Q&A (15 min)** — overflow, setup issues, AI questions

**Checkpoint:** Your screen shows OpenCode running. You've typed a prompt and seen the agent respond. You can explain what a context window is and why specific prompts produce better output.

### Deliverables

- All students have OpenCode running with API key configured
- Students understand context windows, prompting, research, and debugging

---

## Lesson 2: Domain, Product, and Tech Decisions (3h)

**WHY:** The agent can't build what you can't describe. This lesson is about describing — understanding the domain, choosing the right tools, and writing it all down.

**HOW:** Use the agent as a research partner. Explore the domain, define the product, choose the tech, document decisions.

**WHAT:**

- **Recap (5 min)** — what we learned last time, what we're doing today
- **Research — understand the domain using the agent (40 min)**
  - What is a meal? What data does it contain?
  - What foods are in the TACO database? What nutrition info do they have?
  - What's the user journey? (log a meal → see history → track progress)
  - Browse `assets/food-nutrition-db/` together — open 1-2 files to see the CSV structure: food code, description, nutrients per 100g
  - Optional: use `@.agents/skills/firecrawl.md` to explore current Brazilian dietary guidelines or nutrition patterns online
- **Q&A (10 min)** — domain questions, data exploration
- **Design — define the product (25 min)**
  - A nutrition tracker where users log meals, see calories/macros, view history, track progress with charts, and use AI to recognize food from photos
  - We prioritize features that teach: CRUD operations, relations, hooks, and API integration
- **Tech decisions — choose the tools (25 min)**
  - Why PocketBase — a single file gives us a database and API with no setup. Tradeoff: less flexibility than building a custom server.
  - Why Quasar — ready-made buttons, forms, and charts we can customize. Tradeoff: we follow its structure, not our own.
  - Note: PocketBase hooks are an advanced topic we'll see in the photo feature but won't build from scratch — see `@.agents/skills/pocketbase.md` section 9 to learn more.
- **Q&A (5 min)** — tech questions before we start documenting
- **Document — write down everything we decided (55 min)**
  - Quick overview of existing specs: `docs/MEAL-PARSER-STRATEGY.md` (AI pipeline design), `docs/FOOD-NUTRITION-DB.md` (TACO data reference) — read on your own time
  - Write `EPICS.md` — break the project into small epics (a self-contained chunk of work: 3–5 tasks, ~1 day each)
  - Walk through how the agent will use these specs: EPICS.md for task breakdown, MEAL-PARSER-STRATEGY.md for the photo feature, FOOD-NUTRITION-DB.md for data structure
- **Buffer (5 min)** — overflow, extra questions, catch-up
- **Q&A (10 min)** — specs, tech choices, documentation

**Checkpoint:** Your `EPICS.md` is written and lists every feature we discussed, broken into small epics. You can explain the user journey and why we chose PocketBase and Quasar.

### Deliverables

- `EPICS.md` written in the repo
- Students understand the domain, the product, and why we chose these tools

---

## Lesson 3: Build the App (3h)

**WHY:** A spec without working code is a wish. Today we build the entire app — from bootstrap to the AI-powered photo feature.

**HOW:** You are the product owner. The agent is the developer. You give it a task from EPICS.md, it writes the code, you review the diff, you run it, you test it. If something is wrong, describe the problem clearly — the agent fixes faster when you're specific.

**WHAT:**

- **Recap (5 min)** — what we decided last time, what we're building today
- **Ground the specs (10 min)** — quick whiteboard: map features to PocketBase collection names and Quasar component names. Use `@.agents/skills/pocketbase.md` and `@.agents/skills/quasar.md` for reference.
- **Dispatch 1: Epics 1–4 (55 min)** — instruct the agent to build: project bootstrap, PocketBase schema with TACO data, meal logging UI, and nutrition calculation. Wait for the agent to finish, then review the output and verify with `@.agents/skills/agent-browser.md`.
- **Dispatch 2: Epics 5–8 (55 min)** — provide your OpenCode Go API key to the agent so it can configure the `.env` file for the photo feature. Then instruct the agent to build: meal history with date navigation, environment variables, weekly/monthly charts, and photo-based meal registration (instructor demo). Review and verify.
- **Buffer / Q&A (55 min)** — overflow, catch-up, fix anything that didn't work, final questions

**Checkpoint:** Your screen shows a complete nutrition tracker: meal logging with food search, history with dates, charts showing weekly progress, and the photo feature demonstrated.

### Deliverables

- Complete NutriVibe app with all features working
- Meal logging with nutrition calculation
- Meal history with edit/delete
- Weekly/monthly charts
- Photo-based meal registration demonstrated

---

## Lesson 4: Testing, Hosting, and Orchestration (3h)

**WHY:** The app works on your machine. Now we prove it works reliably, make it available to users, and learn how to manage multiple AI agents for complex projects.

**HOW:** Instruct the agent to write tests for you, deploy to production with minimal infrastructure, then explore how to orchestrate agents for larger workflows.

**WHAT:**

- **Recap (5 min)** — what we built, why testing and hosting matter
- **Testing with the agent (55 min)**
  - What is E2E testing? Why Playwright? (10 min)
  - Run existing tests: navigate to `playwright/` directory, run `npx playwright test`, verify all tests pass, explore the HTML report (15 min)
  - Instruct the agent to write more tests: "Write Playwright tests for the meal logging flow — open modal, search food, select, set quantity, save" (20 min)
  - Review the agent's test output, run the new tests, debug any failures together (10 min)
- **Q&A (5 min)** — testing questions, agent workflow
- **Hosting with cPanel + PM2 (55 min)**
  - Why cPanel + PM2? Cheapest option — Node.js is only needed to run PM2, not the app itself (10 min)
  - Build the app: `cd src && quasar build` (outputs to `pocketbase/pb_public/`)
  - Upload to cPanel: upload the entire `pocketbase/` directory to your home directory via File Manager or FTP. Don't touch `public_html` — PocketBase serves the SPA from its own `pb_public/`.
  - Only edit `public_html/.htaccess` to proxy traffic to PocketBase's internal port 8090
  - Deploy with the agent:
    - Instruct the agent:

      ```text
      SSH into my server at `<HOST>` port `<PORT>` as user `<USERNAME>`
      (password: `<PASSWORD>` / key: `<PATH_TO_KEY>`).

      Upload the pocketbase/ directory to my home directory.

      Install mise (https://mise.jdx.dev/) and use it to install Node.js
      (needed to run PM2, not the app itself).

      Install PM2 and configure it to run PocketBase.

      Make pocketbase executable with `chmod +x ~/pocketbase/pocketbase`.

      Start PocketBase with PM2 and save the configuration:
      `pm2 start ~/pocketbase/pocketbase --name pocketbase -- serve --http=0.0.0.0:8090`
      `pm2 save`

      Add a cron job via crontab to restore PM2 processes on reboot:
      `(crontab -l 2>/dev/null; echo "@reboot /home/<USERNAME>/.local/share/mise/shims/pm2 resurrect") | crontab -`

      Edit public_html/.htaccess to proxy traffic from port 80/443
      to PocketBase's internal port 8090.
      ```
    - Review the agent's commands and output
    - Verify the deployment: access the app via domain, test basic functionality
  - Updating the app: rebuild locally, upload new files, restart with `pm2 restart`
- **Q&A (5 min)** — deployment questions, troubleshooting
- **Orchestration with agent-starter-kit (55 min)**
  - What is orchestration? Managing multiple AI agents for complex workflows (10 min)
  - Introduction to [ntorga/agent-starter-kit](https://github.com/ntorga/agent-starter-kit) (10 min)
  - Demo: how the starter kit structures multi-agent projects (15 min)
  - Use cases: when to use orchestration vs single-agent workflows (10 min)
  - Q&A and next steps (10 min)

**Checkpoint:** You've instructed the agent to write E2E tests and seen them pass. You understand how to deploy the app to cPanel with PM2. You've seen how agent-starter-kit orchestrates multiple agents and know when to use it.

### Deliverables

- Playwright test suite with tests written by the agent
- App deployed to production via cPanel + PM2
- Understanding of agent orchestration concepts and tools

---

## Workflow Summary

```
Lesson 1: Stock the pantry — set up tools and learn how AI thinks
Lesson 2: Read the recipe — understand the domain and write the specs
Lesson 3: Cook — build the entire app with the agent
Lesson 4: Taste, serve, and scale — test, deploy, and orchestrate agents
```

---

## Glossary

- **SPA** — Single Page Application: a website that loads once and updates without refreshing the whole page
- **CRUD** — Create, Read, Update, Delete: the four basic operations on data
- **Hook** — code that runs automatically when something happens (e.g., when a record is saved)
- **Collection** — a table in the database (PocketBase calls tables "collections")
- **Relation** — a link between two collections (e.g., a meal entry relates to a food item)
- **API** — Application Programming Interface: how the frontend talks to the backend
- **Endpoint** — a specific URL where the API accepts requests
- **Frontend** — the part the user sees and interacts with (Quasar/Vue)
- **Backend** — the part that runs on the server, handles data and logic (PocketBase)
- **Database** — where data is stored (PocketBase uses SQLite)
- **SQLite** — a lightweight database that stores everything in a single file
- **JSVM** — JavaScript Virtual Machine: PocketBase's built-in JavaScript runtime for hooks
- **Context window** — how much text the AI can "see" at once, like a page limit
- **Prompt** — the instruction you give to the AI agent
- **Diff** — the changes the agent made to the code, shown as red (removed) and green (added) lines
- **Epic** — a small, self-contained chunk of work (3–5 tasks, ~1 day)
- **OpenCode** — the CLI tool you run in your terminal to interact with the AI agent
- **OpenCode Go** — the paid subscription service that provides access to AI models
- **Mimo V2.5** — an image recognition model accessible through OpenCode Go, used to identify foods from photos
- **Agent-browser** — a tool that lets the AI agent see and interact with a browser to verify UI
- **TACO** — Brazilian food nutrition database with 597 foods
- **mise** — a tool that manages programming language versions (Node.js, etc.)
- **WSL** — Windows Subsystem for Linux: lets you run Linux tools on Windows
- **`.env`** — a file that stores secret configuration values (like API keys) outside of source code
- **pnpm** — a fast, disk-efficient package manager (alternative to npm)
- **Vite** — the build tool Quasar uses under the hood to bundle and serve your app
- **Superuser** — PocketBase admin account with full access to the admin UI and API
- **Pinia** — Vue's state management library for sharing data between components
- **Boot file** — Quasar's way to run code when the app starts (used for SDK setup)
- **E2E testing** — End-to-end testing: simulating real user interactions in a browser to verify the app works
- **Playwright** — a testing framework that automates browser interactions for E2E tests
- **cPanel** — a web hosting control panel that provides a GUI for managing websites, files, databases, and more
- **PM2** — a production process manager for Node.js applications that keeps your app running even after crashes or server reboots
- **Orchestration** — coordinating multiple AI agents to work together on complex tasks, each handling a specific part of the workflow

---

## Troubleshooting

### Setup issues

- **`npm install -g` fails with permissions** — don't use `sudo`. Fix npm permissions: `mkdir ~/.npm-global && npm config set prefix '~/.npm-global'` and add `~/.npm-global/bin` to your PATH.
- **WSL install hangs** — restart your computer and try again. WSL needs a reboot after enabling the Windows feature.
- **PocketBase binary doesn't run** — make it executable: `chmod +x pocketbase` (Mac/Linux). Start it with `./pocketbase serve`. On Windows, check your antivirus.
- **`node --version` not found** — close and reopen your terminal. If still not found, check that mise is in your PATH.
- **OpenCode says "API key not configured"** — run `opencode config` and verify the API key is set. Check the OpenCode Go dashboard to confirm your subscription is active.
- **Agent-browser can't launch** — check that a browser is installed and accessible. Try running `agent-browser install` again.

### Agent issues

- **Agent produces broken code** — don't panic. Copy the error message, paste it to the agent, and say "fix this." The agent fixes faster when you show the actual error.
- **Agent ignores your spec** — be more specific. Instead of "add a form," say "add a form with a food selector dropdown, a quantity input in grams, and a submit button that saves to the meal_entries collection."
- **Agent repeats the same mistake** — start a new conversation. Sometimes the agent gets stuck in a pattern.
- **Agent produces code you don't understand** — ask it to explain: "what does this function do?" or "why did you choose this approach?"

### PocketBase issues

- **Collections not showing up** — restart PocketBase. Check the admin UI at `http://127.0.0.1:8090/_/`.
- **API returns 404** — check the collection name and endpoint URL. PocketBase uses lowercase collection names in URLs.
- **Data not persisting** — check that the API call returns 200 in the browser's Network tab. If using the PocketBase JS SDK, ensure you're calling `.create()` or `.update()` on the collection, not just modifying local state.
- **SyntaxError in browser console** — PocketBase JS SDK may throw parse errors in dev mode. This is a known issue with Vite's dev server. The app still works; ignore the error or use `quasar build` for a clean test.
- **CSP errors blocking API calls** — Content Security Policy may block PocketBase requests in dev. Add `http://127.0.0.1:8090` to your CSP policy or check the Quasar config for proxy settings.
