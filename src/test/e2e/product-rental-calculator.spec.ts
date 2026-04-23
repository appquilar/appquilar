import { expect, test } from "./fixtures";
import { selectAvailableRentalDates } from "./dateRangePicker";
import { registerNetworkMocks } from "./networkMocks";

test("product calculator starts without prefilled dates or availability checks", async ({ page }) => {
  let availabilityCalls = 0;

  await registerNetworkMocks(page);

  await page.addInitScript(() => {
    window.localStorage.setItem(
      "auth_token",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEiLCJyb2xlcyI6WyJST0xFX1VTRVIiXSwiZXhwIjo0MTAyNDQ0ODAwfQ.signature"
    );
  });

  await page.route("**/api/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          id: "user-1",
          email: "victor@appquilar.test",
          first_name: "Victor",
          last_name: "Saavedra",
          roles: ["ROLE_USER"],
        },
      }),
    });
  });

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

  await page.route("**/api/products/product-1/availability?**", async (route) => {
    availabilityCalls += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          can_request: true,
          status: "available",
          managed_by_platform: true,
          message: "Disponible para esa cantidad y esas fechas.",
        },
      }),
    });
  });

  await page.goto("/producto/taladro-profesional");

  await expect(page.getByRole("heading", { name: "Calcula tu alquiler" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Calcular coste" })).toBeDisabled();
  await expect(page.getByText("Disponible para esa cantidad y esas fechas.")).not.toBeVisible();
  await expect(page.getByText("Selecciona").first()).toBeVisible();
  expect(availabilityCalls).toBe(0);
});

test("product calculator lets the user complete the rental range after choosing a start date", async ({ page }) => {
  await registerNetworkMocks(page);

  await page.addInitScript(() => {
    window.localStorage.setItem(
      "auth_token",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEiLCJyb2xlcyI6WyJST0xFX1VTRVIiXSwiZXhwIjo0MTAyNDQ0ODAwfQ.signature"
    );
  });

  await page.route("**/api/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          id: "user-1",
          email: "victor@appquilar.test",
          first_name: "Victor",
          last_name: "Saavedra",
          roles: ["ROLE_USER"],
        },
      }),
    });
  });

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

  await page.route("**/api/products/product-1/availability?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          can_request: true,
          status: "available",
          managed_by_platform: true,
          message: "Disponible para esa cantidad y esas fechas.",
        },
      }),
    });
  });

  await page.goto("/producto/taladro-profesional");
  await page.getByRole("button", { name: "Seleccionar fechas de alquiler" }).click();
  const { startLabel, endLabel } = await selectAvailableRentalDates(page);

  const dateTrigger = page.getByRole("button", { name: "Seleccionar fechas de alquiler" });
  await expect(dateTrigger).toContainText(startLabel);
  await expect(dateTrigger).toContainText(endLabel);
  await expect(page.getByText("Disponible para esa cantidad y esas fechas.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Calcular coste" })).toBeEnabled();
});
