# pppt-playwright

TypeScript-first Playwright BDD test automation framework using Gherkin feature files and `playwright-bdd`.

## Prerequisites

1. Node.js version defined in .nvmrc
2. Yarn
3. VS Code

## Setup

1. Clone this repository.
2. Use the pinned Node.js version:

```bash
nvm use
```

3. Install dependencies:

```bash
yarn install
```

4. Create local environment variables:

```bash
cp .env.template .env
```

5. Update `.env` values as needed for your environment.

## Project Structure

- `e2e/features/` Gherkin scenarios (`.feature`)
- `e2e/steps/` TypeScript step definitions (`.ts`)
- `e2e/pages/` Page objects (`.ts`)
- `e2e/support/` Shared helpers/config (`.ts`)
- `.features-gen/` Generated Playwright tests (do not edit directly)

## Scripts

- `yarn bddgen` Generate Playwright tests from feature files
- `yarn test` Generate tests, then run all scenarios in headless mode
- `yarn test:headed` Generate tests, then run in headed mode
- `yarn test:grep "<pattern>"` Generate tests, then run only tests matching grep pattern
- `yarn test:grep:headed "<pattern>"` Same as above, but in headed mode
- `yarn report:cucumber` Generate Multiple Cucumber HTML report from cucumber JSON
- `yarn test:cucumber` Run all tests, then generate Multiple Cucumber HTML report

## Run Specific Tests

- Run scenarios by tag:
	- `yarn test:grep "@test"`
	- Replace `@test` with any tag used in your feature files.
- Run a single scenario by name:
	- `yarn test:grep "Continue shopping from cart returns to inventory"`
- Run in headed mode with a filter:
	- `yarn test:grep:headed "@test"`

## How To Add Or Update Tests

1. Add or update scenario steps in `e2e/features/*.feature`.
2. Implement or update matching steps in `e2e/steps/*.ts`.
3. Add reusable selectors/actions in `e2e/pages/*.ts`.
4. Run `yarn test`.

## Notes

- This framework is BDD-first. Author test flows in feature files and keep automation logic in TypeScript step definitions.
- If editor diagnostics show undefined steps, confirm VS Code Cucumber extension settings are using TypeScript glue paths.
- Cucumber JSON output is written to `cucumber-report/cucumber-report.json` and HTML report to `cucumber-report/html/index.html`.
- Cucumber reporting is the single reporting flow in this project.

*Last updated: 12 June 2026*
