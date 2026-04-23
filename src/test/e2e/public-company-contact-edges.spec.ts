import { expect, test } from "./fixtures";
import { registerNetworkMocks } from "./networkMocks";

test.beforeEach(async ({ page }) => {
  await registerNetworkMocks(page);
});

test("company page corrects out-of-range pages and keeps the company fallback copy visible", async ({
  page,
}) => {
  const requestedPages: number[] = [];

  await page.route("**/api/public/companies/alquileres-norte", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          name: "Alquileres Norte",
          slug: "alquileres-norte",
          description: null,
          profile_picture_id: null,
          header_image_id: null,
          location: {
            city: "Madrid",
            state: "Comunidad de Madrid",
            country: "España",
            display_label: "Madrid, Comunidad de Madrid, España",
          },
          address: null,
          geo_location: null,
        },
      }),
    });
  });

  await page.route("**/api/public/companies/alquileres-norte/products?**", async (route) => {
    const currentPage = Number(new URL(route.request().url()).searchParams.get("page") ?? "1");
    requestedPages.push(currentPage);

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        total: 13,
        page: currentPage,
        data: currentPage === 2
          ? [
              {
                id: "product-13",
                internal_id: "P-013",
                name: "Andamio modular",
                slug: "andamio-modular",
                description: "Sistema modular para obra.",
                publication_status: "published",
                image_ids: [],
                categories: [{ id: "cat-1", name: "Vehículos", slug: "vehiculos" }],
                owner_data: {
                  owner_id: "company-1",
                  type: "company",
                  name: "Alquileres Norte",
                },
              },
            ]
          : [],
      }),
    });
  });

  await page.goto("/empresa/alquileres-norte?page=3");

  await expect(page).toHaveURL(/\/empresa\/alquileres-norte\?page=2$/);
  await expect(page.getByText("Catálogo público de productos publicados en Appquilar.")).toBeVisible();
  await expect(page.getByText("Página 2 de 2")).toBeVisible();
  await expect(page.getByText("Andamio modular")).toBeVisible();
  expect(requestedPages).toEqual(expect.arrayContaining([3, 2]));
});

test("company page shows catalog and profile edge states", async ({ page }) => {
  await page.route("**/api/public/companies/alquileres-norte/products?**", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({
        message: "No se pudo recuperar el catálogo.",
      }),
    });
  });

  await page.goto("/empresa/alquileres-norte");
  await expect(page.getByText("No se pudo cargar el catálogo público de esta empresa.")).toBeVisible();

  await page.unroute("**/api/public/companies/alquileres-norte/products?**");
  await page.route("**/api/public/companies/alquileres-norte", async (route) => {
    await route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({
        message: "Empresa no encontrada",
      }),
    });
  });

  await page.goto("/empresa/alquileres-norte");
  await expect(page.getByRole("heading", { name: "Empresa no encontrada" })).toBeVisible();
});

test("contact page surfaces backend field errors and captcha-specific failures", async ({ page }) => {
  let submitAttempts = 0;

  await page.route("**/api/captcha/config", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          enabled: false,
          site_key: null,
        },
      }),
    });
  });

  await page.route("**/api/contact", async (route) => {
    submitAttempts += 1;

    if (submitAttempts === 1) {
      await route.fulfill({
        status: 422,
        contentType: "application/json",
        body: JSON.stringify({
          message: "Validation failed",
          errors: {
            topic: ["Selecciona un tema válido."],
            name: ["El nombre ya existe en otra solicitud."],
            email: ["El email no se pudo validar."],
            message: ["El mensaje contiene contenido no permitido."],
          },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 422,
      contentType: "application/json",
      body: JSON.stringify({
        message: "Captcha failed",
        errors: {
          captchaToken: ["captcha.invalid"],
        },
      }),
    });
  });

  await page.goto("/contacto");

  await page.getByLabel("Nombre").fill("Victor");
  await page.getByLabel("Email").fill("victor@appquilar.test");
  await page.getByLabel("Mensaje").fill("Necesito ayuda con un catálogo profesional completo.");
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "Prensa" }).click();
  await page.getByRole("button", { name: "Enviar" }).click();

  await expect(page.getByText("Selecciona un tema válido.")).toBeVisible();
  await expect(page.getByText("El nombre ya existe en otra solicitud.")).toBeVisible();
  await expect(page.getByText("El email no se pudo validar.")).toBeVisible();
  await expect(page.getByText("El mensaje contiene contenido no permitido.")).toBeVisible();

  await page.getByRole("button", { name: "Enviar" }).click();
  await expect(
    page.getByText("No se pudo validar reCAPTCHA. Por favor, inténtalo de nuevo.")
  ).toBeVisible();
});
