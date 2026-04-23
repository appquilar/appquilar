import { expect, test as base } from "@playwright/test";
import { explorePageForCoverage, persistPageCoverage } from "./coverage";

const resolvePositiveNumber = (raw: string | undefined, fallback: number): number => {
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

const isCoverageExplorationEnabled =
  process.env.E2E_COVERAGE_EXPLORATORY === "1"
  && process.env.E2E_PUBLIC_COVERAGE_EXPLORATORY === "1";
const explorationTimeoutMs = isCoverageExplorationEnabled
  ? resolvePositiveNumber(process.env.E2E_COVERAGE_FIXTURE_TIMEOUT_MS, 2600)
  : 1200;
const persistTimeoutMs = isCoverageExplorationEnabled ? 7000 : 5000;

const test = base.extend<{ coverageCapture: void }>({
  coverageCapture: [
    async ({ page }, use, testInfo) => {
      await use();
      const skipCoverageExploration = testInfo.annotations.some(
        (annotation) => annotation.type === "skipCoverageExploration"
      );
      const skipCoveragePersistence = testInfo.annotations.some(
        (annotation) => annotation.type === "skipCoveragePersistence"
      );

      if (isCoverageExplorationEnabled && !skipCoverageExploration) {
        await explorePageForCoverage(page, { budgetMs: explorationTimeoutMs });
      }

      if (!skipCoveragePersistence) {
        await persistPageCoverage(page, testInfo, { budgetMs: persistTimeoutMs });
      }
    },
    { auto: true },
  ],
});

export { test, expect };
