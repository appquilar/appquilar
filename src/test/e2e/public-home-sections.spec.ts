import { expect, test } from "./fixtures";
import { registerNetworkMocks } from "./networkMocks";

test.beforeEach(async ({ page }) => {
  await registerNetworkMocks(page);
});

test("public home connects search, categories, featured products and FAQ interactions", async ({
  page,
}) => {
  await page.goto("/");

  await page
    .getByPlaceholder("Buscar herramientas, equipos o categorías...")
    .fill("Taladro premium");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL(/\/buscar\?q=Taladro%20premium$/);

  await page.goBack();
  await expect(page.getByRole("heading", { name: /La Forma Inteligente de Alquilar/i })).toBeVisible();

  await page.getByRole("link", { name: "Ver todas las categorías" }).click();
  await expect(page).toHaveURL(/\/categorias$/);
  await expect(page.getByRole("heading", { name: "Todas las categorías" })).toBeVisible();

  await page.goBack();
  await page.getByRole("button", { name: "Ver producto" }).first().click();
  await expect(page).toHaveURL(/\/producto\/taladro-profesional$/);
  await expect(page.getByRole("heading", { name: "Taladro profesional" })).toBeVisible();

  await page.goBack();
  await page.getByRole("button", { name: "¿Cómo funciona Appquilar?" }).click();
  await expect(
    page.getByText(/marketplace donde empresas y particulares publican productos para alquilar/i)
  ).toBeVisible();
});

test("public home shows the latest-products empty state when the featured query returns no items", async ({
  page,
}) => {
  await page.route("**/api/products/search?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          data: [],
          total: 0,
          page: 1,
        },
      }),
    });
  });

  await page.goto("/");

  await expect(page.getByText("Todavía no hay productos publicados.")).toBeVisible();
});
