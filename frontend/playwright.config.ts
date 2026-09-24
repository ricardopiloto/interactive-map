import { defineConfig, devices } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.E2E_PORT ?? 4173)
const BASE = process.env.E2E_ORIGIN ?? `http://127.0.0.1:${PORT}`
const API_PORT = Number(process.env.E2E_API_PORT ?? 8001)
const DATA_DIR = process.env.DATA_DIR ?? path.join(__dirname, 'e2e', '.data')

export default defineConfig({
  testDir: './e2e',
  testMatch: /.*\.spec\.ts/,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'e2e-report' }]],
  timeout: 90_000,
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    },
  },
  use: {
    baseURL: BASE,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } },
    },
    {
      name: 'mobile',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        defaultBrowserType: 'chromium',
      },
    },
  ],
  webServer: [
    {
      command: `DATA_DIR="${DATA_DIR}" COOKIE_SECURE=false PUBLIC_BASE_URL="${BASE}" CORS_ORIGINS="${BASE},http://localhost:${PORT}" uv run uvicorn app.main:app --host 127.0.0.1 --port ${API_PORT}`,
      cwd: path.join(__dirname, '..', 'backend'),
      url: `http://127.0.0.1:${API_PORT}/api/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: `E2E_API_URL=http://127.0.0.1:${API_PORT} npm run build && E2E_API_URL=http://127.0.0.1:${API_PORT} npm run preview -- --host 127.0.0.1 --port ${PORT}`,
      cwd: __dirname,
      url: BASE,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  ],
})
