import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    headless: true,
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
    actionTimeout: 5000,
  },
  webServer: {
    command: 'npm run dev',
    port: 5177,
    reuseExistingServer: true,
  }
})
