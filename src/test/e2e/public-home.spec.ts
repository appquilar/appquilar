import { expect, test } from "./fixtures";
import { registerNetworkMocks } from "./networkMocks";

test.beforeEach(async ({ page }) => {
  await registerNetworkMocks(page);
});

test("public home renders and category panel can be opened/closed", async ({ page }) => {
  await page.goto("/");

  const allCategoriesButton = page.locator("button:visible", { hasText: "Todas las categorías" }).first();
  await expect(allCategoriesButton).toBeVisible();

  await allCategoriesButton.click();

  const categorySearchInput = page.getByPlaceholder("Buscar categoría...");
  await expect(categorySearchInput).toBeVisible({ timeout: 10000 });

  await allCategoriesButton.click();

  await expect(categorySearchInput).toBeHidden();
});
