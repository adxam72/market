import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', timeout: 60000, workers: 1, reporter: 'list',
  expect: { timeout: 15000 },
  use: { baseURL: 'http://127.0.0.1:8080', channel: process.env.CI ? undefined : 'chrome', screenshot: 'only-on-failure' },
  projects: [{ name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } }, { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } }],
  webServer: { command: 'npm run dev -- --host 127.0.0.1 --port 8080', url: 'http://127.0.0.1:8080', reuseExistingServer: true, timeout: 60000 },
  outputDir: 'artifacts/test-results',
});
