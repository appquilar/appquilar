import { expect, test } from "./fixtures";
import { registerNetworkMocks } from "./networkMocks";

test.beforeEach(async ({ page }) => {
  await registerNetworkMocks(page);
});

test("guest product page supports gallery navigation and both auth CTAs", async ({ page }) => {
  await page.route("**/api/products/taladro-profesional", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          id: "product-1",
          internal_id: "P-001",
          name: "Taladro profesional",
          slug: "taladro-profesional",
          description: "Taladro para obra y reformas.",
          publication_status: "published",
          is_rental_enabled: true,
          image_ids: ["img-1", "img-2", "img-3"],
          categories: [{ id: "cat-1", name: "Vehículos", slug: "vehiculos" }],
          owner_data: {
            owner_id: "company-1",
            type: "company",
            name: "Alquileres Norte",
            slug: "alquileres-norte",
            address: {
              street: "Calle Mayor 7",
              street2: null,
              city: "Madrid",
              postal_code: "28013",
              state: "Comunidad de Madrid",
              country: "España",
            },
            geo_location: {
              latitude: 40.4168,
              longitude: -3.7038,
              circle: [],
            },
          },
          tiers: [
            {
              days_from: 1,
              days_to: 3,
              price_per_day: {
                amount: 2500,
                currency: "EUR",
              },
            },
          ],
          deposit: {
            amount: 15000,
            currency: "EUR",
          },
        },
      }),
    });
  });

  await page.goto("/producto/taladro-profesional");

  await expect(page.getByRole("heading", { name: "Taladro profesional" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Siguiente imagen" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ir a imagen 2" })).toBeVisible();

  await page.getByRole("button", { name: "Siguiente imagen" }).click();
  await expect(page.getByRole("button", { name: "Ir a imagen 2" })).toHaveClass(/w-2\.5/);

  await page.getByRole("button", { name: "Crear cuenta gratis" }).click();
  const modal = page.getByRole("dialog");
  await expect(modal.getByRole("button", { name: "Crear cuenta" })).toBeVisible();

  await modal.getByRole("button", { name: "Cerrar" }).click();
  await page.getByRole("button", { name: "Ya tengo cuenta" }).click();
  await expect(modal.getByText("Accede a tu cuenta")).toBeVisible();

  await expect(page.getByText("Madrid, Comunidad de Madrid").first()).toBeVisible();
});
