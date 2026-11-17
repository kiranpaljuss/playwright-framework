# Playwright Test Automation Framework

[![CI](https://github.com/kiranpaljuss/playwright-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/kiranpaljuss/playwright-framework/actions/workflows/ci.yml)
[![Test report](https://img.shields.io/badge/test%20report-GitHub%20Pages-blue)](https://kiranpaljuss.github.io/playwright-framework/)

An end-to-end UI test framework built with **Playwright** and **TypeScript**, testing the [SauceDemo](https://www.saucedemo.com) e-commerce site.

**[View the latest test report →](https://kiranpaljuss.github.io/playwright-framework/)**

## What's covered

| Area | Tests |
| --- | --- |
| [Login](e2e/tests/login.spec.ts) | Successful login, locked-out user, invalid credentials (data-driven), logout |
| [Cart](e2e/tests/cart.spec.ts) | Add multiple items, remove from cart and inventory, continue shopping |
| [Sorting](e2e/tests/sorting.spec.ts) | All four sort options, verified against the rendered data |
| [Checkout](e2e/tests/checkout.spec.ts) | Full purchase journey with price/tax/total verification, form validation |

18 tests × 3 browsers (Chromium, Firefox, WebKit), run on every push, on pull requests and nightly.

## Design decisions

- **Log in once, reuse the session.** A [setup project](e2e/auth.setup.ts) logs in through the UI and saves the session. Every test then starts already authenticated, so only the login tests use the login form. This keeps the suite fast without skipping real coverage.
- **Page objects provided as fixtures.** Each page object ([`e2e/pages`](e2e/pages)) is injected through [Playwright fixtures](e2e/fixtures.ts). Every test gets isolated instances, with no shared mutable state, so `fullyParallel` is safe.
- **Component composition.** The site header (cart badge, menu, logout) is a reusable [`Header`](e2e/pages/components/header.ts) component composed into the pages that display it.
- **Resilient locators.** Locators use `data-test` attributes and accessible roles (`getByRole('button', { name: 'Add to cart' })`), never CSS paths or IDs derived from product names.
- **Web-first assertions only.** Assertions like `toHaveText([...])` retry until the UI settles, so there are no hard waits and no flaky "read once, then compare" checks.
- **Calculated expectations, not hard-coded ones.** Sorting and checkout totals are checked by computing the expected result from the page's own data, so the tests survive catalogue and price changes.
- **Data-driven tests and tags.** Variations such as invalid logins and missing checkout fields are generated from data tables. Tests are tagged by area (`@login`, `@cart` …) and level (`@smoke`, `@regression`) so subsets can be run on demand.
- **Config via environment.** Credentials and `BASE_URL` come from environment variables, with safe defaults in `.env.template`, so the same suite can target another environment without code changes.

## Tech stack

Playwright · TypeScript (strict) · ESLint (typescript-eslint + eslint-plugin-playwright) · GitHub Actions · GitHub Pages · Dependabot

## Project structure

```
e2e/
├── tests/             # Test specs, one per area of the site
├── pages/             # Page objects
│   └── components/    # Reusable UI components shared across pages
├── auth.setup.ts      # Logs in once and saves the session for all tests
├── fixtures.ts        # Extends Playwright's test with page object fixtures
└── users.ts           # User personas → credentials (from env)
.github/
├── workflows/ci.yml   # Lint, typecheck, cross-browser test matrix, report publishing
└── dependabot.yml     # Weekly dependency and GitHub Actions updates
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
| `yarn test` | Run all tests in all browsers |
| `yarn test:chromium` | Run all tests in Chromium only |
| `yarn test:smoke` | Run only `@smoke` tests |
| `yarn test:grep "@checkout"` | Run tests matching a tag or name |
| `yarn test:headed` | Run in a visible browser (Chromium) |
| `yarn test:ui` | Open Playwright UI mode for debugging |
| `yarn report` | Open the HTML report from the last run |
| `yarn validate` | Lint and typecheck |

## Reports and debugging

The Playwright HTML report (`playwright-report/`) includes screenshots, video and a full trace for any failed test. Open a trace with `npx playwright show-trace <trace.zip>`.

In CI, each browser's report is uploaded as a build artifact, and the latest `main` run is published to [GitHub Pages](https://kiranpaljuss.github.io/playwright-framework/).

## Adding a test

1. Add a test to the matching file in `e2e/tests/`, or create a new `*.spec.ts` file, importing `test` and `expect` from `e2e/fixtures.ts`.
2. Put selectors and page interactions in a page object. If it's a new page, expose it as a fixture in `e2e/fixtures.ts`.
3. Tag the test (`@smoke` or `@regression`, plus its area).
4. Run `yarn test:chromium` and `yarn validate`.
