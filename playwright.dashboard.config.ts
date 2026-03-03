import { defineConfig, devices } from "@playwright/test";

const appPort = Number(process.env.E2E_APP_PORT ?? 4173);
const seedPort = Number(process.env.E2E_SEED_PORT ?? 18080);
const appUrl = `http://127.0.0.1:${appPort}`;
const seedApiUrl = `http://127.0.0.1:${seedPort}`;
const siteId = process.env.VITE_APPQUILAR_SITE_ID ?? "550e8400-e29b-41d4-a716-446655440000";
const isCoverageRun = process.env.E2E_COVERAGE === "1";
const isCiRun = !!process.env.CI;

export default defineConfig({
  testDir: "./src/test/e2e/dashboard",
  // Needed for real test-level sharding (otherwise sharding is file-based).
  fullyParallel: !isCoverageRun,
  forbidOnly: isCiRun,
  retries: isCiRun ? 1 : 0,
  workers: isCiRun || isCoverageRun ? 1 : undefined,
  reporter: isCiRun ? "github" : "list",
  use: {
    baseURL: appUrl,
    trace: "on-first-retry",
    viewport: { width: 1440, height: 900 },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: `E2E_SEED_PORT=${seedPort} node ./scripts/e2e/seed-server.mjs`,
      url: `${seedApiUrl}/api/health`,
      reuseExistingServer: !isCiRun && !isCoverageRun,
      timeout: 120000,
    },
    {
      command: `VITE_API_BASE_URL=${seedApiUrl} VITE_APPQUILAR_SITE_ID=${siteId} npm run dev -- --host 127.0.0.1 --port ${appPort}`,
      url: appUrl,
      reuseExistingServer: !isCiRun && !isCoverageRun,
      timeout: 120000,
    },
  ],
});
