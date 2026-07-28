# Playwright E2E Tests

Basic end-to-end tests for NutriVibe using Playwright.

## Running Tests

```bash
cd playwright
npx playwright test
```

## Test Structure

- `tests/basic.spec.ts` - Smoke tests for navigation and page rendering
  - Home page: title, nutrition cards, empty state
  - Navigation: between all pages (Hoje, Histórico, Gráficos)
  - History page: title, date navigation
  - Charts page: title, metric options

## Notes

- Tests run against PocketBase at `http://127.0.0.1:8090`
- The app uses hash-based routing (`/#/path`)
- Playwright automatically starts PocketBase via the `webServer` config
- Only Chromium is configured (headless by default)

## Viewing Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```
