import { expect, test as base, type APIRequestContext, type Page } from "@playwright/test";
import { explorePageForCoverage, persistPageCoverage } from "../coverage";

export type SeedRole = "admin" | "company_admin" | "user";

const resolvePositiveNumber = (raw: string | undefined, fallback: number): number => {
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

const seedApiUrl = process.env.E2E_SEED_API_URL ?? "http://127.0.0.1:18080";
const isCoverageExplorationEnabled = process.env.E2E_COVERAGE_EXPLORATORY === "1";
const explorationTimeoutMs = isCoverageExplorationEnabled
  ? resolvePositiveNumber(process.env.E2E_COVERAGE_FIXTURE_TIMEOUT_MS, 2600)
  : 1200;
const persistTimeoutMs = isCoverageExplorationEnabled ? 7000 : 5000;

const sleep = async (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const shouldRetryNetworkError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  return /ECONNRESET|ECONNREFUSED|ETIMEDOUT|EPIPE|socket hang up|read ECONNRESET/i.test(message);
};

type PostOptions = Parameters<APIRequestContext["post"]>[1];

const postWithRetry = async (
  request: APIRequestContext,
  url: string,
  options?: PostOptions
): Promise<Awaited<ReturnType<APIRequestContext["post"]>>> => {
  const maxAttempts = resolvePositiveNumber(process.env.E2E_SEED_RETRY_ATTEMPTS, 4);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await request.post(url, options);

      if (response.status() >= 500 && attempt < maxAttempts) {
        await sleep(attempt * 150);
        continue;
      }

      return response;
    } catch (error) {
      const canRetry = shouldRetryNetworkError(error) && attempt < maxAttempts;
      if (!canRetry) {
        throw error;
      }

      await sleep(attempt * 150);
    }
  }

  // Should never happen, but keeps TypeScript exhaustive.
  throw new Error(`Unable to POST after retries: ${url}`);
};

const seedUsers: Record<SeedRole, { email: string; password: string }> = {
  admin: {
    email: "admin.e2e@appquilar.test",
    password: "E2Epass!123",
  },
  company_admin: {
    email: "company.admin.e2e@appquilar.test",
    password: "E2Epass!123",
  },
  user: {
    email: "user.e2e@appquilar.test",
    password: "E2Epass!123",
  },
};

const resetSeed = async (request: APIRequestContext): Promise<void> => {
  const response = await postWithRetry(request, `${seedApiUrl}/api/test/reset`);
  expect(response.ok()).toBeTruthy();
};

const setToken = async (page: Page, token: string): Promise<void> => {
  await page.addInitScript((tokenValue: string) => {
    window.localStorage.setItem("auth_token", tokenValue);
  }, token);
};

const clearToken = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    window.localStorage.removeItem("auth_token");
  });
};

const loginAs = async (
  page: Page,
  request: APIRequestContext,
  role: SeedRole
): Promise<void> => {
  const credentials = seedUsers[role];

  const response = await postWithRetry(request, `${seedApiUrl}/api/auth/login`, {
    data: credentials,
  });

  expect(response.ok()).toBeTruthy();

  const payload = await response.json();
  const token = payload?.data?.token;

  expect(typeof token).toBe("string");

  await setToken(page, token as string);
};

type DashboardSeedFixture = {
  reset: (request: APIRequestContext) => Promise<void>;
  loginAs: (page: Page, request: APIRequestContext, role: SeedRole) => Promise<void>;
  clearToken: (page: Page) => Promise<void>;
  users: Record<SeedRole, { email: string; password: string }>;
  apiUrl: string;
};

const runWithTimeout = async (callback: () => Promise<void>, timeoutMs: number): Promise<void> => {
  await Promise.race([
    callback(),
    new Promise<void>((resolve) => {
      setTimeout(() => resolve(), timeoutMs);
    }),
  ]);
};

export const test = base.extend<{ seed: DashboardSeedFixture; coverageCapture: void }>({
  coverageCapture: [
    async ({ page }, use, testInfo) => {
      await use();
      await runWithTimeout(async () => explorePageForCoverage(page), explorationTimeoutMs);
      await runWithTimeout(async () => persistPageCoverage(page, testInfo), persistTimeoutMs);
    },
    { auto: true },
  ],
  seed: async ({}, useFixture) => {
    await useFixture({
      reset: resetSeed,
      loginAs,
      clearToken,
      users: seedUsers,
      apiUrl: seedApiUrl,
    });
  },
});

export { expect };
