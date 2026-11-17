import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { STANDARD_USER_STATE } from './e2e/users';

// .env.template holds safe defaults (SauceDemo's public demo credentials); a local .env overrides them.
dotenv.config({ path: '.env.template', quiet: true });
dotenv.config({ path: '.env', override: true, quiet: true });

const isCI = !!process.env.CI;

// Every browser project starts from the session saved by auth.setup.ts.
const browserProject = (name: string, device: string) => ({
  name,
  testDir: './e2e/tests',
  dependencies: ['setup'],
  use: { ...devices[device], storageState: STANDARD_USER_STATE }
});

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: [
    [isCI ? 'github' : 'list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',
    testIdAttribute: 'data-test',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    browserProject('chromium', 'Desktop Chrome'),
    browserProject('firefox', 'Desktop Firefox'),
    browserProject('webkit', 'Desktop Safari')
  ]
});
