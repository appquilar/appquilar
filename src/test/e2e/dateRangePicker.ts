import type { Page } from "@playwright/test";

const RENTAL_DATE_TRIGGER_NAME = "Seleccionar fechas de alquiler";
const DISPLAY_DATE_PATTERN = /\d{2}\/\d{2}\/\d{4}/g;

export const selectAvailableRentalDates = async (
  page: Page
): Promise<{ startLabel: string; endLabel: string }> => {
  const firstMonth = page.getByRole("grid").first();
  const availableDayButtons = firstMonth.locator("button:not([disabled])");
  const availableDayCount = await availableDayButtons.count();

  if (availableDayCount < 2) {
    throw new Error("Expected at least two enabled rental dates in the first visible month.");
  }

  await availableDayButtons.first().click();
  await availableDayButtons.nth(Math.min(2, availableDayCount - 1)).click();

  const triggerText = await page
    .getByRole("button", { name: RENTAL_DATE_TRIGGER_NAME })
    .textContent();
  const selectedDates = triggerText?.match(DISPLAY_DATE_PATTERN) ?? [];

  if (selectedDates.length !== 2) {
    throw new Error(`Expected two selected rental dates, received: ${triggerText ?? "<empty>"}`);
  }

  return {
    startLabel: selectedDates[0],
    endLabel: selectedDates[1],
  };
};
