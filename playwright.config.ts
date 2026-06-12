import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import dotenv from 'dotenv';

const templateEnvPath = resolve(process.cwd(), '.env.template');
const localEnvPath = resolve(process.cwd(), '.env');

if (existsSync(templateEnvPath)) {
  dotenv.config({ path: templateEnvPath, quiet: true });
}

if (existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath, override: true, quiet: true });
}

const testDir = defineBddConfig({
  outputDir: '.features-gen',
  features: 'e2e/features/**/*.feature',
  steps: 'e2e/steps/**/*.ts'
});

export default defineConfig({
  testDir,
  reporter: [['playwright-bdd/reporter/cucumber', {
    $type: 'json',
    outputFile: 'cucumber-report/cucumber-report.json',
    addMetadata: 'object'
  }]],
  use: {
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome']
      }
    }
  ]
});