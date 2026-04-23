import { expect, test } from "./fixtures";
import { registerNetworkMocks } from "./networkMocks";

test.beforeEach(async ({ page }) => {
  await registerNetworkMocks(page);
});

test("category drawer search shows nested breadcrumbs and navigates to the selected category", async ({
  page,
}) => {
  await page.route("**/api/categories", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [
          { id: "cat-1", name: "Vehículos", slug: "vehiculos", parent_id: null },
          { id: "cat-2", name: "Accesorios", slug: "accesorios", parent_id: "cat-1" },
          { id: "cat-3", name: "Remolques", slug: "remolques", parent_id: "cat-1" },
        ],
        total: 3,
        page: 1,
        per_page: 50,
      }),
    });
  });

  await page.goto("/");

  const allCategoriesButton = page.getByRole("button", { name: "Todas las categorías" }).first();
  await allCategoriesButton.click();

  const categorySearchInput = page.getByPlaceholder("Buscar categoría...");
  await categorySearchInput.fill("acces");
  await expect(page.getByText("Resultados")).toBeVisible();
  await expect(page.getByRole("link", { name: "Accesorios" }).first()).toBeVisible();
  await page.getByRole("link", { name: "Accesorios" }).first().click();

  await expect
    .poll(() => new URL(page.url()).pathname)
    .toBe("/categoria/accesorios");
});

test("category page applies dynamic property filters and price ranges", async ({ page }) => {
  let lastSearchQuery = "";

  await page.route("**/api/categories/vehiculos", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          id: "cat-1",
          name: "Vehículos",
          slug: "vehiculos",
          description: "Vehículos para trabajo y eventos",
          parent_id: null,
        },
      }),
    });
  });

  await page.route("**/api/categories/dynamic-properties?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          dynamic_filters_enabled: true,
          disabled_reason: null,
          definitions: [
            {
              code: "color",
              label: "Color",
              type: "select",
              filterable: true,
              options: [
                { value: "rojo", label: "Rojo" },
                { value: "azul", label: "Azul" },
              ],
            },
            {
              code: "potencia",
              label: "Potencia",
              type: "number",
              filterable: true,
              unit: "cv",
            },
          ],
        },
      }),
    });
  });

  await page.route("**/api/products/search?**", async (route) => {
    lastSearchQuery = new URL(route.request().url()).search;

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          data: [
            {
              id: "product-1",
              internal_id: "VH-001",
              name: "Furgoneta de carga",
              slug: "furgoneta-carga",
              description: "Vehículo industrial",
              publication_status: "published",
              image_ids: [],
              categories: [{ id: "cat-1", name: "Vehículos", slug: "vehiculos" }],
              owner_data: {
                owner_id: "company-1",
                type: "company",
                name: "Alquileres Norte",
              },
            },
          ],
          total: 1,
          page: 1,
          available_dynamic_filters: [
            {
              code: "color",
              label: "Color",
              type: "select",
              options: [
                { value: "rojo", label: "Rojo", count: 1 },
                { value: "azul", label: "Azul", count: 1 },
              ],
            },
            {
              code: "potencia",
              label: "Potencia",
              type: "number",
              range: {
                min: 10,
                max: 90,
              },
            },
          ],
        },
      }),
    });
  });

  await page.goto("/categoria/vehiculos");

  await expect(page.getByRole("heading", { name: "Vehículos" })).toBeVisible();
  await expect(page.getByText("Propiedades")).toBeVisible();

  await page.getByLabel("Rojo").check();
  await page.getByPlaceholder("Mín. 10").fill("20");
  await page.getByPlaceholder("Máx. 90").fill("80");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();

  await expect(page.getByText("Furgoneta de carga")).toBeVisible();
  await expect
    .poll(() => lastSearchQuery)
    .toContain("property_values%5Bcolor%5D%5B%5D=rojo");
  expect(lastSearchQuery).toContain("categories%5B%5D=cat-1");
  expect(lastSearchQuery).toContain("property_ranges%5Bpotencia%5D%5Bmin%5D=20");
  expect(lastSearchQuery).toContain("property_ranges%5Bpotencia%5D%5Bmax%5D=80");
});
