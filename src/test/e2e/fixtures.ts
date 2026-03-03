import { expect, test as base } from "@playwright/test";
import { explorePageForCoverage, persistPageCoverage } from "./coverage";

const resolvePositiveNumber = (raw: string | undefined, fallback: number): number => {
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

const isCoverageExplorationEnabled = process.env.E2E_COVERAGE_EXPLORATORY === "1";
const explorationTimeoutMs = isCoverageExplorationEnabled
  ? resolvePositiveNumber(process.env.E2E_COVERAGE_FIXTURE_TIMEOUT_MS, 2600)
  : 1200;
const persistTimeoutMs = isCoverageExplorationEnabled ? 7000 : 5000;

const runWithTimeout = async (callback: () => Promise<void>, timeoutMs: number): Promise<void> => {
  await Promise.race([
    callback(),
    new Promise<void>((resolve) => {
      setTimeout(() => resolve(), timeoutMs);
    }),
  ]);
};

const test = base.extend<{ coverageCapture: void }>({
  coverageCapture: [
    async ({ page }, use, testInfo) => {
      await use();
      await runWithTimeout(async () => explorePageForCoverage(page), explorationTimeoutMs);
      await runWithTimeout(async () => persistPageCoverage(page, testInfo), persistTimeoutMs);
    },
    { auto: true },
  ],
});

export { test, expect };
