import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { STANDARD_USER_STATE } from './e2e/users';

// .env.template holds safe defaults (public demo credentials for SauceDemo and DummyJSON); a local .env overrides them.
dotenv.config({ path: '.env.template', quiet: true });
dotenv.config({ path: '.env', override: true, quiet: true });

const isCI = !!process.env.CI;

// Every browser project starts from the session saved by auth.setup.ts.
// Accessibility scans give the same results in every browser, so they run in Chromium only.
const browserProject = (name: string, device: string) => ({
  name,
  testDir: './e2e/tests',
  dependencies: ['setup'],
  grepInvert: name === 'chromium' ? undefined : /@a11y/,
  use: { ...devices[device], storageState: STANDARD_USER_STATE }
});

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  // In CI each job writes a blob report; a final job merges them into one HTML report.
  reporter: isCI
    ? [['github'], ['blob']]
    : [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',
    testIdAttribute: 'data-test',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'api',
      testDir: './api/tests',
      use: { baseURL: process.env.API_BASE_URL || 'https://dummyjson.com' }
    },
    browserProject('chromium', 'Desktop Chrome'),
    browserProject('firefox', 'Desktop Firefox'),
    browserProject('webkit', 'Desktop Safari')
  ]
});
