import { expect, test } from "./fixtures";

const jsonHeaders = { "content-type": "application/json" };

test.describe("Dashboard public edge coverage", () => {
  test.beforeEach(async ({ seed, request, page }) => {
    await seed.reset(request);
    await seed.clearToken(page);
  });

  test("public company page corrects out-of-range pages and surfaces catalog failures", async ({
    page,
  }, testInfo) => {
    testInfo.setTimeout(60000);
    testInfo.annotations.push({
      type: "skipCoverageExploration",
      description: "Route-mocked public company edge cases already land on a terminal state for coverage.",
    });

    const requestedPages: number[] = [];

    await page.route("**/api/public/companies/alquileres-norte", async (route) => {
      await route.fulfill({
        status: 200,
        headers: jsonHeaders,
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
        status: currentPage === 1 ? 500 : 200,
        headers: jsonHeaders,
        body: JSON.stringify(
          currentPage === 1
            ? { message: "No se pudo recuperar el catálogo." }
            : {
                success: true,
                total: 13,
                page: currentPage,
                data: [
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
                ],
              }
        ),
      });
    });

    await page.goto("/empresa/alquileres-norte");
    await expect(page.getByText("No se pudo cargar el catálogo público de esta empresa.")).toBeVisible();

    await page.goto("/empresa/alquileres-norte?page=3");
    await expect(page).toHaveURL(/\/empresa\/alquileres-norte\?page=2$/);
    await expect(page.getByText("Catálogo público de productos publicados en Appquilar.")).toBeVisible();
    await expect(page.getByText("Página 2 de 2")).toBeVisible();
    expect(requestedPages).toEqual(expect.arrayContaining([1, 3, 2]));
  });

  test("public contact page shows backend validation and captcha-specific errors", async ({ page }, testInfo) => {
    testInfo.setTimeout(60000);
    testInfo.annotations.push({
      type: "skipCoverageExploration",
      description: "Route-mocked public contact edge cases do not benefit from post-test exploration.",
    });

    let submitAttempts = 0;

    await page.route("**/api/captcha/config", async (route) => {
      await route.fulfill({
        status: 200,
        headers: jsonHeaders,
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

      await route.fulfill({
        status: 422,
        headers: jsonHeaders,
        body: JSON.stringify(
          submitAttempts === 1
            ? {
                message: "Validation failed",
                errors: {
                  topic: ["Selecciona un tema válido."],
                  name: ["El nombre ya existe en otra solicitud."],
                  email: ["El email no se pudo validar."],
                  message: ["El mensaje contiene contenido no permitido."],
                },
              }
            : {
                message: "Captcha failed",
                errors: {
                  captchaToken: ["captcha.invalid"],
                },
              }
        ),
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
});
