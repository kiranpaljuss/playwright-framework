import path from 'node:path';
import { generate } from 'multiple-cucumber-html-reporter';

const reportsRoot = path.resolve(process.cwd(), 'cucumber-report');

generate({
  jsonDir: reportsRoot,
  reportPath: path.join(reportsRoot, 'html'),
  pageTitle: 'BDD Test Report',
  reportName: 'Playwright BDD - Cucumber Report',
  displayDuration: true,
  openReportInBrowser: false,
  metadata: {
    browser: {
      name: 'chromium'
    },
    platform: {
      name: process.platform,
      version: process.version
    }
  }
});

console.log('Cucumber HTML report generated at cucumber-report/html/index.html');
