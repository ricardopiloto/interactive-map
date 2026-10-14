import { defineConfig, devices } from "@playwright/test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const root = import.meta.dirname;
const port = Number(process.env.E2E_PORT ?? 4174);
const origin = process.env.E2E_ORIGIN ?? `http://127.0.0.1:${port}`;
const apiPort = Number(process.env.E2E_API_PORT ?? 8002);
const dataDir = process.env.DATA_DIR ?? mkdtempSync(path.join(tmpdir(), "codex-frontend-v2-e2e-"));

export default defineConfig({
  testDir: "./e2e",
  testMatch: /.*\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "e2e-report" }]],
  use: { baseURL: origin, trace: "on-first-retry" },
  projects: [{ name: "desktop", use: { ...devices["Desktop Chrome"], locale: "pt-BR" } }],
  webServer: [
    {
      command: `DATA_DIR="${dataDir}" E2E_ORIGIN="${origin}" uv run python ../frontend/e2e/seed_e2e.py && DATA_DIR="${dataDir}" COOKIE_SECURE=false PUBLIC_BASE_URL="${origin}" CORS_ORIGINS="${origin},http://localhost:${port}" uv run uvicorn app.main:app --host 127.0.0.1 --port ${apiPort}`,
      cwd: path.join(root, "..", "backend"),
      url: `http://127.0.0.1:${apiPort}/api/health`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: `E2E_API_URL=http://127.0.0.1:${apiPort} npm run build && E2E_API_URL=http://127.0.0.1:${apiPort} npm run preview -- --host 127.0.0.1 --port ${port}`,
      cwd: root,
      url: origin,
      reuseExistingServer: false,
      timeout: 180_000,
    },
  ],
});
