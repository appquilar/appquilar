import { expect, test } from "./fixtures";
import { registerNetworkMocks } from "./networkMocks";
import { buildSearchPath } from "@/domain/config/publicRoutes";

test.beforeEach(async ({ page }) => {
  await registerNetworkMocks(page);
});

test("hero search navigates to search page and shows results", async ({ page }) => {
  await page.goto("/");

  const heroSearchInput = page.getByPlaceholder("Buscar herramientas, equipos o categorías...").first();
  await heroSearchInput.fill("taladro");
  await heroSearchInput.press("Enter");

  await expect
    .poll(() => {
      const url = new URL(page.url());
      return `${url.pathname}${url.search}`;
    })
    .toBe(buildSearchPath("taladro"));
  await expect(page.getByRole("heading", { name: "Taladro profesional" })).toBeVisible();
});
