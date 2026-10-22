import { defineConfig } from '@playwright/test'

// Browser E2E foundation (M2). It drives the real frontend against the real
// backend and the demo database, so run `npm run demo:reset` in the backend
// first. The journeys here are READ-ONLY (they never approve, edit or cancel),
// so they can be repeated without resetting the demo again.
//
// It uses the locally installed Google Chrome (channel: 'chrome'), so no
// browser download is needed. Servers are started automatically unless
// already running on the usual ports.
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  // State-changing journeys only run against the disposable database (playwright.isolated.config.ts).
  testIgnore: '**/*.isolated.e2e.ts',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    channel: 'chrome',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'npm --prefix ../reqFlow-backend run dev',
      url: 'http://localhost:3000/health',
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: 'npm run dev -- --port 5173 --strictPort',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
})
