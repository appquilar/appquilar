import fs from "node:fs";
import path from "node:path";
import type { Page, TestInfo } from "@playwright/test";

const isCoverageEnabled = process.env.E2E_COVERAGE === "1";
const isCoverageDebugEnabled = process.env.E2E_COVERAGE_DEBUG === "1";
const isCoverageExplorationEnabled = process.env.E2E_COVERAGE_EXPLORATORY === "1";
const rawCoverageDir = path.resolve(process.cwd(), ".e2e-coverage", "raw");

const sanitize = (value: string): string => value.replace(/[^a-zA-Z0-9._-]+/g, "_");

const readCoverageChunk = async (
  page: Page,
  coverageKeys: string[]
): Promise<Record<string, unknown>> => {
  if (coverageKeys.length === 0) {
    return {};
  }

  try {
    return await page.evaluate((keys: string[]) => {
      const rawCoverage = (window as { __coverage__?: Record<string, unknown> }).__coverage__ ?? {};
      const partialCoverage: Record<string, unknown> = {};

      for (const key of keys) {
        const fileCoverage = rawCoverage[key];

        if (fileCoverage) {
          partialCoverage[key] = fileCoverage;
        }
      }

      return partialCoverage;
    }, coverageKeys);
  } catch {
    if (coverageKeys.length === 1) {
      return {};
    }

    const midpoint = Math.floor(coverageKeys.length / 2);
    const firstHalf = await readCoverageChunk(page, coverageKeys.slice(0, midpoint));
    const secondHalf = await readCoverageChunk(page, coverageKeys.slice(midpoint));

    return { ...firstHalf, ...secondHalf };
  }
};

export const persistPageCoverage = async (page: Page, testInfo: TestInfo): Promise<void> => {
  if (!isCoverageEnabled) {
    return;
  }

  const coverageKeys = await page
    .evaluate(() =>
      Object.keys((window as { __coverage__?: Record<string, unknown> }).__coverage__ ?? {})
    )
    .catch(() => []);

  if (!Array.isArray(coverageKeys) || coverageKeys.length === 0) {
    if (isCoverageDebugEnabled) {
      console.log(`[e2e-coverage] no coverage keys for: ${testInfo.title}`);
    }
    return;
  }

  const coverage = await readCoverageChunk(page, coverageKeys);

  if (Object.keys(coverage).length === 0) {
    if (isCoverageDebugEnabled) {
      console.log(`[e2e-coverage] empty merged coverage for: ${testInfo.title}`);
    }
    return;
  }

  fs.mkdirSync(rawCoverageDir, { recursive: true });

  const testReference = `${testInfo.file}:${testInfo.line}:${testInfo.title}`;
  const filename = [
    sanitize(testInfo.project.name),
    sanitize(testReference),
    `retry-${testInfo.retry}`,
    `worker-${testInfo.workerIndex}`,
  ].join("__");

  fs.writeFileSync(path.join(rawCoverageDir, `${filename}.json`), JSON.stringify(coverage), "utf8");

  if (isCoverageDebugEnabled) {
    console.log(
      `[e2e-coverage] persisted ${Object.keys(coverage).length} files for: ${testInfo.title}`
    );
  }
};

const getTimeBudgetRemaining = (budgetEnd: number): number => Math.max(0, budgetEnd - Date.now());

const getStepTimeout = (budgetEnd: number, fallbackMs: number): number =>
  Math.max(150, Math.min(fallbackMs, getTimeBudgetRemaining(budgetEnd)));

const normalizeActionKey = (value: string): string => value.toLowerCase().replace(/\s+/g, " ").trim();

const shouldSkipAction = (label: string): boolean => {
  const normalizedLabel = normalizeActionKey(label);
  const ignoredActionPatterns = [
    "cerrar sesión",
    "cerrar sesion",
    "logout",
    "eliminar",
    "borrar",
    "remove",
    "delete",
    "migrar empresa",
  ];

  return ignoredActionPatterns.some((pattern) => normalizedLabel.includes(pattern));
};

const looksLikeUnlabeledControl = (actionKey: string): boolean => {
  const [text = "", ariaLabel = "", href = ""] = actionKey.split("|");
  return normalizeActionKey(text).length === 0
    && normalizeActionKey(ariaLabel).length === 0
    && normalizeActionKey(href).length === 0;
};

const hasExternalHref = (actionKey: string): boolean => {
  const [, , href = ""] = actionKey.split("|");
  return /^https?:\/\//i.test(href.trim());
};

const safelyFillInputs = async (page: Page, budgetEnd: number): Promise<void> => {
  const inputLocator = page.locator(
    "input:not([type='hidden']):not([type='file']):not([disabled]), textarea:not([disabled])"
  );
  const inputHandles = (await inputLocator.elementHandles()).slice(0, 8);

  for (const input of inputHandles) {
    if (getTimeBudgetRemaining(budgetEnd) <= 0) {
      return;
    }

    try {
      await input.scrollIntoViewIfNeeded();
      const inputType = (await input.getAttribute("type"))?.toLowerCase() ?? "text";

      if (inputType === "checkbox" || inputType === "radio") {
        await input.check({ timeout: 400 }).catch(() => undefined);
        continue;
      }

      const valueByType: Record<string, string> = {
        email: "e2e.coverage@appquilar.test",
        tel: "600000000",
        number: "1",
        date: "2026-01-15",
        "datetime-local": "2026-01-15T10:00",
        url: "https://appquilar.test",
      };

      const value = valueByType[inputType] ?? "coverage";
      await input.fill(value, { timeout: getStepTimeout(budgetEnd, 550) }).catch(() => undefined);
    } catch {
      // Best effort only: ignore non-actionable controls.
    }
  }
};

const safelySelectOptions = async (page: Page, budgetEnd: number): Promise<void> => {
  const selectLocator = page.locator("select:not([disabled])");
  const selectCount = Math.min(await selectLocator.count(), 3);

  for (let index = 0; index < selectCount; index += 1) {
    if (getTimeBudgetRemaining(budgetEnd) <= 0) {
      return;
    }

    try {
      const select = selectLocator.nth(index);
      const optionValues = await select.locator("option").evaluateAll((options) =>
        options
          .map((option) => (option as HTMLOptionElement).value)
          .filter((value) => value !== "")
      );

      if (optionValues.length > 0) {
        await select
          .selectOption(optionValues[optionValues.length - 1], {
            timeout: getStepTimeout(budgetEnd, 550),
          })
          .catch(() => undefined);
      }
    } catch {
      // Best effort only: ignore non-actionable selects.
    }
  }
};

const safelyClickElements = async (page: Page, budgetEnd: number): Promise<void> => {
  const clickableLocator = page.locator(
    "button:not([disabled]), [role='button']:not([aria-disabled='true']), [role='tab'], summary, [data-state], a[href]:not([href^='mailto:']):not([href^='tel:'])"
  );
  const clickableHandles = (await clickableLocator.elementHandles()).slice(0, 18);
  const visitedActionKeys = new Set<string>();

  for (const clickable of clickableHandles) {
    if (getTimeBudgetRemaining(budgetEnd) <= 0) {
      return;
    }

    try {
      await clickable.scrollIntoViewIfNeeded();
      const actionKey = await clickable
        .evaluate((element) => {
          const htmlElement = element as HTMLElement;
          const text = htmlElement.innerText?.trim() ?? "";
          const ariaLabel = htmlElement.getAttribute("aria-label") ?? "";
          const href = htmlElement.getAttribute("href") ?? "";
          return `${text}|${ariaLabel}|${href}`;
        })
        .catch(() => "");

      const normalizedActionKey = normalizeActionKey(actionKey);
      if (!normalizedActionKey || visitedActionKeys.has(normalizedActionKey)) {
        continue;
      }

      if (looksLikeUnlabeledControl(actionKey)) {
        continue;
      }

      if (hasExternalHref(actionKey)) {
        continue;
      }

      if (shouldSkipAction(normalizedActionKey)) {
        continue;
      }

      visitedActionKeys.add(normalizedActionKey);

      await clickable.click({ timeout: getStepTimeout(budgetEnd, 300) }).catch(() => undefined);
      await page.waitForLoadState("domcontentloaded", { timeout: 200 }).catch(() => undefined);
    } catch {
      // Best effort only.
    }
  }
};

const safelyFillRichTextEditors = async (page: Page, budgetEnd: number): Promise<void> => {
  const editorLocator = page.locator("[contenteditable='true']");
  const editorHandles = (await editorLocator.elementHandles()).slice(0, 2);

  for (const editor of editorHandles) {
    if (getTimeBudgetRemaining(budgetEnd) <= 0) {
      return;
    }

    try {
      await editor.scrollIntoViewIfNeeded();
      await editor.click({ timeout: getStepTimeout(budgetEnd, 300) }).catch(() => undefined);
      await editor.fill("contenido cobertura e2e", {
        timeout: getStepTimeout(budgetEnd, 400),
      }).catch(() => undefined);
    } catch {
      // Ignore rich text edge cases.
    }
  }
};

const safelyScrollPage = async (page: Page, budgetEnd: number): Promise<void> => {
  if (getTimeBudgetRemaining(budgetEnd) <= 0) {
    return;
  }

  await page.mouse.wheel(0, 1800).catch(() => undefined);
  await page.waitForTimeout(75).catch(() => undefined);

  if (getTimeBudgetRemaining(budgetEnd) <= 0) {
    return;
  }

  await page.mouse.wheel(0, -900).catch(() => undefined);
};

const resolveExplorationBudgetMs = (requestedBudgetMs?: number): number => {
  const envBudgetMs = Number(process.env.E2E_COVERAGE_EXPLORATION_MS ?? 1600);
  const fallbackBudget = Number.isFinite(envBudgetMs) && envBudgetMs > 400 ? envBudgetMs : 1600;

  if (typeof requestedBudgetMs !== "number") {
    return fallbackBudget;
  }

  return Number.isFinite(requestedBudgetMs) && requestedBudgetMs > 400
    ? requestedBudgetMs
    : fallbackBudget;
};

export const exercisePageInteractions = async (
  page: Page,
  options: { budgetMs?: number } = {}
): Promise<void> => {
  const budgetEnd = Date.now() + resolveExplorationBudgetMs(options.budgetMs);

  try {
    await page.waitForLoadState("domcontentloaded", {
      timeout: getStepTimeout(budgetEnd, 700),
    }).catch(() => undefined);

    await safelyFillInputs(page, budgetEnd);
    await safelyFillRichTextEditors(page, budgetEnd);
    await safelySelectOptions(page, budgetEnd);
    await safelyClickElements(page, budgetEnd);
    await safelyScrollPage(page, budgetEnd);
    await page.keyboard.press("Escape").catch(() => undefined);
  } catch {
    // Coverage exploration must never fail the test run.
  }
};

export const explorePageForCoverage = async (page: Page): Promise<void> => {
  if (!isCoverageExplorationEnabled) {
    return;
  }

  await exercisePageInteractions(page);
};
