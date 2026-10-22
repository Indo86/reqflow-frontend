import { defineConfig } from '@playwright/test'

// Menjalankan E2E dengan basis data terpisah agar data pengembangan tetap aman.
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  // Menjalankan E2E dengan basis data terpisah agar data pengembangan tetap aman.
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
