# Playwright BDD Test Automation Framework

[![CI](https://github.com/kiranpaljuss/playwright-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/kiranpaljuss/playwright-framework/actions/workflows/ci.yml)
[![Test report](https://img.shields.io/badge/test%20report-GitHub%20Pages-blue)](https://kiranpaljuss.github.io/playwright-framework/)

An end-to-end UI test framework built with **Playwright**, **TypeScript** and **Gherkin** (via [playwright-bdd](https://github.com/vitalets/playwright-bdd)), testing the [SauceDemo](https://www.saucedemo.com) e-commerce site.

Scenarios are written in plain English so the whole team can read them, and they run as native Playwright tests. That means you keep Playwright's parallelism, fixtures, auto-waiting, tracing and cross-browser support.

**[View the latest test report →](https://kiranpaljuss.github.io/playwright-framework/)**

## What's covered

| Feature | Scenarios |
| --- | --- |
| [Login](e2e/features/login.feature) | Successful login, locked-out user, invalid credentials (data-driven), logout |
| [Cart](e2e/features/cart.feature) | Add multiple items (data table), remove from cart and inventory, continue shopping |
| [Sorting](e2e/features/sorting.feature) | All four sort options, verified against the rendered data |
| [Checkout](e2e/features/checkout.feature) | Full purchase journey with price/tax/total verification, form validation |

18 scenarios × 3 browsers (Chromium, Firefox, WebKit), run on every push, on pull requests and nightly.

## Design decisions

- **Page objects provided as fixtures.** Each page object ([`e2e/pages`](e2e/pages)) is injected through Playwright fixtures ([`e2e/support/fixtures.ts`](e2e/support/fixtures.ts)). Every scenario gets isolated instances, steps only ask for what they use, and there's no shared mutable state, so `fullyParallel` is safe.
- **Component composition.** The site header (cart badge, menu, logout) is a reusable [`Header`](e2e/pages/components/header.ts) component composed into the pages that display it.
- **Resilient locators.** Locators use `data-test` attributes and accessible roles (`getByRole('button', { name: 'Add to cart' })`), never CSS paths or IDs derived from product names.
- **Web-first assertions only.** Assertions like `toHaveText([...])` retry until the UI settles, so there are no hard waits and no flaky "read once, then compare" checks.
- **Behaviour-focused Gherkin.** Steps use Cucumber expressions (`{string}`, `{int}`) and describe user intent, not clicks. Data tables and scenario outlines keep data-driven cases readable.
- **Calculated expectations, not hard-coded ones.** Sorting and checkout totals are checked by computing the expected result from the page's own data, so the tests survive catalogue and price changes.
- **Config via environment.** Credentials and `BASE_URL` come from environment variables, with safe defaults in `.env.template`, so the same suite can target another environment without code changes.

## Tech stack

Playwright · TypeScript (strict) · playwright-bdd · Cucumber/Gherkin · ESLint (typescript-eslint + eslint-plugin-playwright) · GitHub Actions · GitHub Pages

## Project structure

```
e2e/
├── features/          # Gherkin scenarios, tagged by area (@login, @cart …) and level (@smoke, @regression)
├── steps/             # Step definitions, one file per domain area
├── pages/             # Page objects
│   └── components/    # Reusable UI components shared across pages
└── support/
    ├── fixtures.ts    # Playwright fixtures + BDD step factory
    └── users.ts       # User personas → credentials (from env)
scripts/               # Cucumber HTML report generation
.github/workflows/     # CI: lint, typecheck, cross-browser matrix, report publishing
```

## Getting started

Prerequisites: Node.js 24 (see [`.nvmrc`](.nvmrc)) and Yarn 1.

```bash
nvm use
yarn install
npx playwright install --with-deps
cp .env.template .env   # optional; defaults are SauceDemo's public demo credentials
yarn test
```

## Commands

| Command | Description |
| --- | --- |
| `yarn test` | Run all scenarios in all browsers |
| `yarn test:chromium` | Run all scenarios in Chromium only |
| `yarn test:smoke` | Run only `@smoke` scenarios |
| `yarn test:grep "@checkout"` | Run scenarios matching a tag or name |
| `yarn test:headed` | Run in a visible browser (Chromium) |
| `yarn test:ui` | Open Playwright UI mode for debugging |
| `yarn report` | Open the Playwright HTML report |
| `yarn report:cucumber` | Build the Cucumber HTML report (`cucumber-report/html`) |
| `yarn validate` | Lint and typecheck |

## Reports and debugging

- **Playwright HTML report** (`playwright-report/`) includes screenshots, video and a full trace for any failed test. Open a trace with `npx playwright show-trace <trace.zip>`.
- **Cucumber HTML report** (`cucumber-report/html/`) gives a business-readable, feature-by-feature view of results.
- In CI, both reports are uploaded as build artifacts, and the latest `main` run is published to [GitHub Pages](https://kiranpaljuss.github.io/playwright-framework/).

## Adding a test

1. Write the scenario in `e2e/features/*.feature`, reusing existing steps where possible.
2. Add any new steps to the matching file in `e2e/steps/`.
3. Put selectors and page interactions in a page object, then expose it as a fixture in `e2e/support/fixtures.ts` if it's a new page.
4. Run `yarn test:chromium` and `yarn validate`.
