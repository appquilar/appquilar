import { expect, test } from "./fixtures";
import { registerNetworkMocks } from "./networkMocks";

test.beforeEach(async ({ page }) => {
  await registerNetworkMocks(page);
});

test("public home renders and category panel can be opened/closed", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /La Forma Inteligente de Alquilar/i })).toBeVisible({
    timeout: 10000,
  });

  const allCategoriesButton = page.getByRole("button", { name: "Todas las categorías" }).first();
  await expect(allCategoriesButton).toBeVisible();

  await allCategoriesButton.click();

  const categorySearchInput = page.getByPlaceholder("Buscar categoría...");
  await expect(categorySearchInput).toBeVisible({ timeout: 10000 });

  await allCategoriesButton.click();

  await expect(categorySearchInput).toBeHidden();
});
