import { defineConfig, devices } from "@playwright/test";

const isCoverageRun = process.env.E2E_COVERAGE === "1";
const isCiRun = !!process.env.CI;
const siteId = process.env.VITE_APPQUILAR_SITE_ID ?? "test-site";

export default defineConfig({
  testDir: "./src/test/e2e",
  // Dashboard seeded suite has its own config and environment.
  testIgnore: ["**/dashboard/**"],
  fullyParallel: !isCoverageRun,
  forbidOnly: isCiRun,
  retries: isCiRun ? 1 : 0,
  workers: isCiRun || isCoverageRun ? 1 : undefined,
  reporter: isCiRun ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `VITE_LANDING_ONLY_MODE=false VITE_APPQUILAR_SITE_ID=${siteId} npm run dev -- --host 127.0.0.1 --port 4173`,
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !isCiRun && !isCoverageRun,
    timeout: 120000,
  },
});
