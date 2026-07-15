import { defineConfig, devices } from '@playwright/test'

const baseURL = 'http://127.0.0.1:4173'

export default defineConfig({
  expect: { timeout: 5_000 },
  fullyParallel: true,
  outputDir: 'test-results',
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'chromium-mobile', use: { ...devices['Pixel 7'] } },
  ],
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  retries: process.env.CI ? 2 : 0,
  testDir: './e2e',
  trace: 'retain-on-failure',
  use: { baseURL, screenshot: 'only-on-failure' },
  webServer: {
    command: 'yarn dev --mode test-e2e --host 127.0.0.1 --port 4173',
    env: {
      VITE_ADMIN_LOGIN_PATH: '/acceso-cprd-e2e',
      VITE_SUPABASE_ANON_KEY: 'e2e-public-anon-key',
      VITE_SUPABASE_URL: 'http://127.0.0.1:54321',
      VITE_TURNSTILE_SITE_KEY: 'e2e-public-site-key',
    },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: baseURL,
  },
})
