import { expect, test } from "./fixtures";
import { registerNetworkMocks } from "./networkMocks";

test.beforeEach(async ({ page }) => {
  await registerNetworkMocks(page);

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
          is_inventory_enabled: true,
          inventory_mode: "managed_serialized",
          booking_policy: "platform_managed",
          allows_quantity_request: true,
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
          image_ids: [],
          inventory_summary: {
            product_id: "product-1",
            product_internal_id: "P-001",
            total_quantity: 1,
            reserved_quantity: 1,
            available_quantity: 0,
            is_rental_enabled: true,
            is_inventory_enabled: true,
            capability_state: "enabled",
            inventory_mode: "managed_serialized",
            is_rentable_now: false,
            unavailability_reason: "out_of_stock",
          },
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
        },
      }),
    });
  });
});

test("product page shows out-of-stock state when inventory is exhausted", async ({ page }) => {
  await page.goto("/producto/taladro-profesional");

  await expect(page.getByRole("heading", { name: "Taladro profesional" })).toBeVisible({
    timeout: 15000,
  });
  await expect(page.getByRole("heading", { name: "Sin stock" })).toBeVisible();
  await expect(page.getByText("Ahora mismo no quedan huecos libres para nuevas reservas.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Alquiler no disponible ahora" })).toBeDisabled();
});
