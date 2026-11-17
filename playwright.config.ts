import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import dotenv from 'dotenv';

// .env.template holds safe defaults (SauceDemo's public demo credentials); a local .env overrides them.
dotenv.config({ path: '.env.template', quiet: true });
dotenv.config({ path: '.env', override: true, quiet: true });

const isCI = !!process.env.CI;

const testDir = defineBddConfig({
  features: 'e2e/features/**/*.feature',
  steps: ['e2e/steps/**/*.ts', 'e2e/support/fixtures.ts']
});

export default defineConfig({
  testDir,
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: [
    [isCI ? 'github' : 'list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['playwright-bdd/reporter/cucumber', {
      $type: 'json',
      outputFile: 'cucumber-report/cucumber-report.json',
      addMetadata: 'object'
    }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',
    testIdAttribute: 'data-test',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ]
});
