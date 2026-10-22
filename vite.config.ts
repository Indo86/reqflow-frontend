import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
const dirname = path.dirname(fileURLToPath(import.meta.url))
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(dirname, './src') } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    env: { VITE_API_BASE_URL: 'http://localhost:3000' },
    clearMocks: true,
    restoreMocks: true,
    unstubGlobals: true,
    // Page-level tests mount whole screens in jsdom and routinely take 3-5s when
    // files run in parallel; the 5s default made them load-dependent.
    testTimeout: 20_000,
  },
})
