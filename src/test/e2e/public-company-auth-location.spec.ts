import { expect, test } from "./fixtures";
import { registerNetworkMocks } from "./networkMocks";

test.beforeEach(async ({ page }) => {
  await registerNetworkMocks(page);
});

test("guest company page keeps approximate location and opens auth CTAs", async ({ page }) => {
  await page.goto("/empresa/alquileres-norte");

  await expect(page.getByRole("heading", { name: "Alquileres Norte" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ubicación aproximada" })).toBeVisible();
  await expect(page.getByText("Madrid, Comunidad de Madrid, España").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Crear cuenta gratis" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ya tengo cuenta" })).toBeVisible();

  await page.getByRole("button", { name: "Ya tengo cuenta" }).click();

  const modal = page.getByRole("dialog");
  await expect(modal.getByText("Accede a tu cuenta")).toBeVisible();
});

test("authenticated company page reveals the exact location and hides auth CTAs", async ({ page }) => {
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

  await page.route("**/api/public/companies/alquileres-norte", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          name: "Alquileres Norte",
          slug: "alquileres-norte",
          description: "Catálogo profesional para rodajes, eventos y obra ligera.",
          profile_picture_id: null,
          header_image_id: null,
          location: {
            city: "Madrid",
            state: "Comunidad de Madrid",
            country: "España",
            display_label: "Madrid, Comunidad de Madrid, España",
          },
          address: {
            street: "Calle Mayor 7",
            street2: "2ºB",
            city: "Madrid",
            postal_code: "28013",
            state: "Comunidad de Madrid",
            country: "España",
          },
          geo_location: {
            latitude: 40.4168,
            longitude: -3.7038,
          },
        },
      }),
    });
  });

  await page.goto("/empresa/alquileres-norte");

  await expect(page.getByRole("heading", { name: "Ubicación" })).toBeVisible();
  await expect(page.getByText("Calle Mayor 7 2ºB").first()).toBeVisible();
  await expect(page.getByText("28013").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Crear cuenta gratis" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Ya tengo cuenta" })).toHaveCount(0);
});
