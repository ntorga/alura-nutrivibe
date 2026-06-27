---
shortDescription: "Web search, scraping, URL discovery, and bulk extraction with Firecrawl CLI"
version: "1.0.0"
lastUpdated: "2026-06-27"
allowed-tools:
  - Bash(firecrawl *)
  - Bash(npx firecrawl *)
---

## Purpose

Provides web search, page scraping, site URL discovery, and bulk content extraction via the Firecrawl CLI. Firecrawl handles JS-rendered SPAs and returns LLM-optimized markdown. It operates on a credit-based billing system, so use it deliberately and only when free alternatives (WebFetch) are insufficient.

## Procedure

### 1. Try WebFetch first (free)

Before using firecrawl, attempt to fetch the URL with the native WebFetch tool. It works for most static sites and costs nothing. Only escalate to firecrawl if WebFetch returns empty/incomplete content or the page is a JS-rendered SPA.

### 2. Choose the right operation

Escalate through these in order based on what you need:

1. **search** (2 credits) — find pages when you don't have a URL
2. **scrape** (1 credit) — extract content from a specific URL
3. **map** (1 credit) — discover all URLs on a site
4. **crawl** (1 credit/page) — bulk extract from many pages

### 3. search — find pages without a URL

Build a precise query to avoid multiple searches:

- Use specific terms: `"react useTransition hook example"` not `"react hooks"`
- Site filter: `site:react.dev useTransition`
- File type: `filetype:pdf react hooks migration guide`
- Exact phrases: `"exact phrase here"`
- Exclusions: `react hooks -pinterest -w3schools`
- Time filter: `--tbs qdr:d` (day), `qdr:w` (week), `qdr:m` (month), `qdr:y` (year)

```bash
firecrawl search "your query" --limit 10 -o .firecrawl/result.json --json
firecrawl search "your query" --scrape --limit 5 -o .firecrawl/scraped.json --json
firecrawl search "your query" --sources news --tbs qdr:d -o .firecrawl/news.json --json
```

Options: `--limit <n>` (default 10, max 100), `--sources <web,images,news>`, `--categories <github,research,pdf>`, `--tbs <qdr:h|d|w|m|y>`, `--scrape`, `--json`, `-o <path>`

After processing results, send feedback to refund 1 credit (within ~2 min, `--silent &` to background):

```bash
SEARCH_ID=$(jq -r '.id' .firecrawl/search.json)
firecrawl search-feedback "$SEARCH_ID" --rating good \
  --valuable-sources '[{"url":"https://example.com","reason":"Most authoritative"}]' \
  --silent &
```

### 4. scrape — extract content from a URL

Try WebFetch first (free). Only use firecrawl scrape if WebFetch fails (JS-rendered SPA, blocked, or incomplete content).

```bash
firecrawl scrape "<url>" -o .firecrawl/page.md
firecrawl scrape "<url>" --only-main-content -o .firecrawl/page.md
firecrawl scrape "<url>" --wait-for 3000 -o .firecrawl/page.md
```

Options: `-f,--format <formats>` (markdown, html, rawHtml, links, screenshot, json), `-Q,--query <prompt>` (+5 credits), `--only-main-content`, `--wait-for <ms>`, `--include-tags`, `--exclude-tags`, `-o <path>`

### 5. map — discover URLs on a site

```bash
firecrawl map "<url>" --search "authentication" -o .firecrawl/filtered.txt
firecrawl map "<url>" --limit 500 --json -o .firecrawl/urls.json
```

Options: `--limit <n>`, `--search <query>`, `--sitemap <include|skip|only>`, `--include-subdomains`, `--json`, `-o <path>`

### 6. crawl — bulk extract from many pages

```bash
firecrawl crawl "<url>" --include-paths /docs --limit 50 --wait -o .firecrawl/crawl.json
firecrawl crawl "<url>" --max-depth 3 --wait --progress -o .firecrawl/crawl.json
```

Options: `--wait`, `--progress`, `--limit <n>`, `--max-depth <n>`, `--include-paths`, `--exclude-paths`, `--delay <ms>`, `--max-concurrency <n>`, `-o <path>`

### 7. Output handling

Always write output to `.firecrawl/` with `-o` to avoid context window bloat. Use `jq` to extract fields:

```bash
jq -r '.data.web[].url' .firecrawl/search.json
jq -r '.data.links[].url' .firecrawl/urls.json
```

Naming convention: `.firecrawl/search-{query}.json`, `.firecrawl/{site}-{path}.md`

## Guardrails

- **WebFetch first.** Firecrawl costs credits. Always try the free WebFetch tool before using firecrawl scrape.
- **Check credit balance.** Run `firecrawl credit-usage` before large crawls or batch operations.
- **Search costs 2 credits.** Craft one precise query instead of multiple vague ones. Use `--limit` to control result count.
- **Scrape `--query` costs 5 extra credits.** Prefer plain scrape to a file, then search the markdown yourself.
- **Crawl costs 1 credit per page.** Use `--include-paths` to scope crawls. Don't crawl an entire site when you only need one section.
- **Map before crawl.** Use `map` to discover URLs first, then decide if a full crawl is worth the credits.
- **`--scrape` on search fetches full content.** Don't re-scrape URLs from search results — the content is already included.
- **Quote URLs.** Shell interprets `?` and `&` as special characters.
- **Search feedback refunds 1 credit.** Send within ~2 minutes via `search-feedback`. Daily cap: 100 credits per team. Use `--silent &` to run in background.
- **Never re-scrape what you already have.** Check if content exists before spending credits.
