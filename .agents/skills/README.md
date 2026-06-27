# Skills

Skills are collected intelligence on how to operate a specific tool — whether that is a CLI, an API, or an MCP/ACP server. They codify procedures, protocols, and output formats that personas reference during execution.

### Available Skills

- `firecrawl.md` — web search, scraping, URL discovery, and bulk extraction with Firecrawl
- `pocketbase.md` — single-file Go backend with embedded SQLite, realtime, auth, and REST API
- `quasar.md` — Vue.js 3 SPA framework with Material Design components and Quasar CLI

## When to Extract a Skill

Extract a skill when:

- A tool proves difficult enough that a human must step in and write an explicit how-to for the agent to follow.
- A procedure must be standardized across multiple personas, such as a shared protocol or output format.

Do not extract when the procedure is short and intuitive. If a competent agent can work it out without written guidance, a skill file adds overhead without value.

## File Naming

Lowercase, hyphenated: `agent-memory.md`, `maestro-dispatch.md`

Persona-specific skills are prefixed with the persona name: `maestro-dispatch.md`, `reviewer-checklist.md`. Universal skills carry no prefix.

## Schema (v0.0.1 // 2026-02-05)

### Frontmatter

- `shortDescription` (Required) — what the skill does in one sentence
- `version` (Required) — semantic version
- `lastUpdated` (Required) — last modification date

### Body

- `Purpose` (Required) — one paragraph on what problem this solves
- `Procedure` (Required) — numbered execution steps with artifact descriptions
- `Guardrails` (Optional) — skill-specific pitfalls and common mistakes
