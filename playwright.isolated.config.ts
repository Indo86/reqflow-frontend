import { defineConfig } from '@playwright/test'

// Menjalankan E2E dengan basis data terpisah agar data pengembangan tetap aman.
const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL must point at the disposable e2e database.')
const database = decodeURIComponent(new URL(databaseUrl).pathname.replace(/^\//, ''))
if (!/e2e/i.test(database)) {
  throw new Error(`Refusing to run: database "${database}" is not a disposable e2e database (name must contain "e2e").`)
}

const API_PORT = 3100
const WEB_PORT = 5174

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    channel: 'chrome',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'npm --prefix ../reqFlow-backend run dev',
      url: `http://localhost:${API_PORT}/health`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: { PORT: String(API_PORT), CORS_ORIGIN: `http://localhost:${WEB_PORT}` },
    },
    {
      command: `npm run dev -- --port ${WEB_PORT} --strictPort`,
      url: `http://localhost:${WEB_PORT}`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: { VITE_API_BASE_URL: `http://localhost:${API_PORT}` },
    },
  ],
})
