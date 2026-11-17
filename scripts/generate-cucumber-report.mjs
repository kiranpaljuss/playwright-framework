import path from 'node:path';
import { generate } from 'multiple-cucumber-html-reporter';

const reportsRoot = path.resolve(process.cwd(), 'cucumber-report');

generate({
  jsonDir: reportsRoot,
  reportPath: path.join(reportsRoot, 'html'),
  pageTitle: 'Playwright BDD Test Report',
  reportName: 'Playwright BDD - Cucumber Report',
  displayDuration: true,
  openReportInBrowser: false,
  customData: {
    title: 'Run info',
    data: [
      { label: 'Platform', value: process.platform },
      { label: 'Node.js', value: process.version },
      { label: 'Generated', value: new Date().toUTCString() }
    ]
  }
});

console.log('Cucumber HTML report generated at cucumber-report/html/index.html');
