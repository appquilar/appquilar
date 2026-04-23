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
  await expect(page.getByTestId("product-card-public-price-mask").first()).toBeVisible();

  await page.getByRole("link", { name: "Ver producto" }).first().click();

  await expect
    .poll(() => {
      const url = new URL(page.url());
      return url.pathname;
    })
    .toBe("/producto/taladro-profesional");

  await expect(page.getByRole("heading", { name: "Taladro profesional" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver empresa" })).toBeVisible();

  await page.getByRole("link", { name: "Ver empresa" }).click();

  await expect
    .poll(() => {
      const url = new URL(page.url());
      return url.pathname;
    })
    .toBe("/empresa/alquileres-norte");

  await expect(page.getByRole("heading", { name: "Alquileres Norte" })).toBeVisible();
  await expect(page.getByText("Ubicación aproximada")).toBeVisible();
  await expect(page.getByRole("button", { name: "Crear cuenta gratis" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ya tengo cuenta" })).toBeVisible();
});
