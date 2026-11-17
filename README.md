# Playwright Test Automation Framework

[![CI](https://github.com/kiranpaljuss/playwright-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/kiranpaljuss/playwright-framework/actions/workflows/ci.yml)
[![Test report](https://img.shields.io/badge/test%20report-GitHub%20Pages-blue)](https://kiranpaljuss.github.io/playwright-framework/)

A test automation framework built with **Playwright** and **TypeScript**, covering three kinds of testing:

- **UI tests** for the [SauceDemo](https://www.saucedemo.com) e-commerce site, in Chromium, Firefox and WebKit
- **API tests** for the [DummyJSON](https://dummyjson.com) REST API, with response contract validation
- **Accessibility tests** that scan every key page against WCAG 2.2 AA with [axe-core](https://github.com/dequelabs/axe-core)

**[View the latest test report →](https://kiranpaljuss.github.io/playwright-framework/)**

## What's covered

**UI** — 18 tests × 3 browsers

| Area | Tests |
| --- | --- |
| [Login](e2e/tests/login.spec.ts) | Successful login, locked-out user, invalid credentials (data-driven), logout |
| [Cart](e2e/tests/cart.spec.ts) | Add multiple items, remove from cart and inventory, continue shopping |
| [Sorting](e2e/tests/sorting.spec.ts) | All four sort options, verified against the rendered data |
| [Checkout](e2e/tests/checkout.spec.ts) | Full purchase journey with price/tax/total verification, form validation |

**API** — 18 tests

| Area | Tests |
| --- | --- |
| [Auth](api/tests/auth.spec.ts) | Login, token-based access, wrong password, missing/invalid token |
| [Products](api/tests/products.spec.ts) | Get by ID, 404s, pagination, field selection, search, category filter, create/update/delete |
| [Carts](api/tests/carts.spec.ts) | Totals consistency, create, merge items into a cart, delete |

**Accessibility** — 7 tests

| Area | Tests |
| --- | --- |
| [Accessibility](e2e/tests/accessibility.spec.ts) | axe scans of login (including its error state), inventory, cart and checkout pages; keyboard-only login |

Everything runs on every push, on pull requests and nightly.

## Design decisions

- **Log in once, reuse the session.** A [setup project](e2e/auth.setup.ts) logs in through the UI and saves the session. Every test then starts already authenticated, so only the login tests use the login form. This keeps the suite fast without skipping real coverage.
- **Page objects provided as fixtures.** Each page object ([`e2e/pages`](e2e/pages)) is injected through [Playwright fixtures](e2e/fixtures.ts). Every test gets isolated instances, with no shared mutable state, so `fullyParallel` is safe.
- **Component composition.** The site header (cart badge, menu, logout) is a reusable [`Header`](e2e/pages/components/header.ts) component composed into the pages that display it.
- **Resilient locators.** Locators use `data-test` attributes and accessible roles (`getByRole('button', { name: 'Add to cart' })`), never CSS paths or IDs derived from product names.
- **Web-first assertions only.** Assertions like `toHaveText([...])` retry until the UI settles, so there are no hard waits and no flaky "read once, then compare" checks.
- **Calculated expectations, not hard-coded ones.** Sorting and checkout totals are checked by computing the expected result from the page's own data, so the tests survive catalogue and price changes.
- **Data-driven tests and tags.** Variations such as invalid logins and missing checkout fields are generated from data tables. Tests are tagged by area (`@login`, `@cart` …) and level (`@smoke`, `@regression`) so subsets can be run on demand.
- **API clients mirror page objects.** [API clients](api/clients.ts) wrap each area of the API, the same way page objects wrap pages, and are injected as fixtures. They return raw responses so tests can assert on status codes and headers, not just bodies.
- **Contract validation.** Every API response is parsed against a [zod schema](api/schemas.ts), so a missing field or a wrong type fails the test even when the test doesn't check that field directly.
- **Shared API login.** A worker-scoped fixture logs in to the API once per worker and shares the token, rather than logging in for every test.
- **Accessibility with known issues tracked.** Scans fail on any WCAG 2.2 A/AA violation. The site has a few existing best-practice issues we can't fix (it's third party), so they're [listed as known issues](e2e/fixtures.ts) with explanations. They stay documented, and anything new still fails the build. Full scan results are attached to each test in the report.
- **Config via environment.** Credentials and `BASE_URL` come from environment variables, with safe defaults in `.env.template`, so the same suite can target another environment without code changes.

## Tech stack

Playwright · TypeScript (strict) · axe-core · zod · ESLint (typescript-eslint + eslint-plugin-playwright) · GitHub Actions · GitHub Pages · Dependabot

## Project structure

```
e2e/                   # UI and accessibility tests (SauceDemo)
├── tests/             # Test specs, one per area of the site
├── pages/             # Page objects
│   └── components/    # Reusable UI components shared across pages
├── auth.setup.ts      # Logs in once and saves the session for all tests
├── fixtures.ts        # Page object and accessibility-scan fixtures
└── users.ts           # User personas → credentials (from env)
api/                   # API tests (DummyJSON)
├── tests/             # Test specs, one per API area
├── clients.ts         # API clients (the API equivalent of page objects)
├── schemas.ts         # Response contracts (zod)
└── fixtures.ts        # API client and shared-token fixtures
.github/
├── workflows/ci.yml   # Lint, typecheck, test matrix (API + 3 browsers), merged report publishing
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
| `yarn test` | Run everything: API tests and UI tests in all browsers |
| `yarn test:chromium` | Run UI and accessibility tests in Chromium only |
| `yarn test:api` | Run the API tests |
| `yarn test:a11y` | Run the accessibility tests |
| `yarn test:smoke` | Run only `@smoke` tests |
| `yarn test:grep "@checkout"` | Run tests matching a tag or name |
| `yarn test:headed` | Run in a visible browser (Chromium) |
| `yarn test:ui` | Open Playwright UI mode for debugging |
| `yarn report` | Open the HTML report from the last run |
| `yarn validate` | Lint and typecheck |

## Reports and debugging

The Playwright HTML report (`playwright-report/`) includes screenshots, video and a full trace for any failed test. Open a trace with `npx playwright show-trace <trace.zip>`.

In CI, the API and browser jobs run in parallel, and their results are merged into a single HTML report. That report is uploaded as a build artifact, and the latest `main` run is published to [GitHub Pages](https://kiranpaljuss.github.io/playwright-framework/).

## Adding a test

1. Add a test to the matching file in `e2e/tests/` (UI) or `api/tests/` (API), or create a new `*.spec.ts` file. Import `test` and `expect` from that folder's `fixtures.ts`.
2. Put selectors and page interactions in a page object, or API calls in a client, and expose new ones as fixtures. Add a zod schema for any new API response.
3. Tag the test (`@smoke` or `@regression`, plus its area).
4. Run `yarn test:chromium` (or `yarn test:api`) and `yarn validate`.
