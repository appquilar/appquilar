import { expect, test } from "@playwright/test";
import { registerNetworkMocks } from "./networkMocks";

test.beforeEach(async ({ page }) => {
  await registerNetworkMocks(page);
});

test("public home renders and category panel can be opened/closed", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /La Forma Inteligente de Alquilar/i })).toBeVisible();

  const allCategoriesButton = page.getByRole("button", { name: /Todas las categorías/i }).first();
  await allCategoriesButton.click();

  await expect(page.getByPlaceholder("Buscar categoría...")).toBeVisible();

  await allCategoriesButton.click();

  await expect(page.getByPlaceholder("Buscar categoría...")).toBeHidden();
});
