import { expect, test } from "@playwright/test";
import { registerNetworkMocks } from "./networkMocks";

test.beforeEach(async ({ page }) => {
  await registerNetworkMocks(page);
});

test("hero search navigates to search page and shows results", async ({ page }) => {
  await page.goto("/");

  const heroSearchInput = page.getByPlaceholder("Buscar herramientas, equipos o categorías...").first();
  await heroSearchInput.fill("taladro");
  await heroSearchInput.press("Enter");

  await expect(page).toHaveURL(/\/search\?q=taladro/);
  await expect(page.getByRole("heading", { name: "Taladro profesional" })).toBeVisible();
});
