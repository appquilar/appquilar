import { expect, test } from "./fixtures";
import { registerNetworkMocks } from "./networkMocks";

test.beforeEach(async ({ page }) => {
  await registerNetworkMocks(page);
});

test("informational and legal pages render their main public content", async ({ page }) => {
  await page.goto("/quienes-somos");
  await expect(page.getByRole("heading", { name: "Quiénes somos" })).toBeVisible();
  await expect(page.getByText("Appquilar es una plataforma")).toBeVisible();

  await page.goto("/contacto");
  await expect(page.getByRole("heading", { name: "Contacto" })).toBeVisible();
  await expect(page.getByText("También puedes escribir directamente")).toBeVisible();

  await page.goto("/legal/aviso-legal");
  await expect(page.getByRole("heading", { name: "Aviso Legal" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "1. Identificación del Titular" })).toBeVisible();

  await page.goto("/legal/terminos");
  await expect(page.getByRole("heading", { name: "Términos y Condiciones" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "1. Registro de usuario" })).toBeVisible();

  await page.goto("/legal/cookies");
  await expect(page.getByRole("heading", { name: "Política de Cookies" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "2. Cookies que utilizamos" })).toBeVisible();

  await page.goto("/legal/privacidad");
  await expect(page.getByRole("heading", { name: "Política de Privacidad" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "1. Responsable del Tratamiento" })).toBeVisible();
});

test("contact page validates required fields, submits successfully and resets the form", async ({
  page,
}) => {
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
    await route.fulfill({ status: 204 });
  });

  await page.goto("/contacto");

  await page.getByRole("button", { name: "Enviar" }).click();
  await expect(page.getByText("Indica tu nombre.")).toBeVisible();
  await expect(page.getByText("Email no válido.")).toBeVisible();
  await expect(page.getByText("Cuéntanos un poco más (mín. 10 caracteres).")).toBeVisible();

  await page.getByLabel("Nombre").fill("Victor");
  await page.getByLabel("Email").fill("victor@appquilar.test");
  await page.getByLabel("Mensaje").fill("Necesito ayuda para publicar un catálogo completo.");
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "Prensa" }).click();
  await page.getByRole("button", { name: "Enviar" }).click();

  await expect(
    page.getByText("Mensaje enviado correctamente. Te responderemos lo antes posible.")
  ).toBeVisible();
  await expect(page.getByLabel("Nombre")).toHaveValue("");
  await expect(page.getByLabel("Email")).toHaveValue("");
  await expect(page.getByLabel("Mensaje")).toHaveValue("");
});

test("blog list paginates and the public article route renders the selected post", async ({ page }) => {
  await page.route("**/api/blog/posts?**", async (route) => {
    const url = new URL(route.request().url());
    const currentPage = url.searchParams.get("page") ?? "1";

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: currentPage === "2"
          ? [
              {
                post_id: "post-2",
                title: "Logística para alquilar mobiliario",
                slug: "logistica-alquilar-mobiliario",
                excerpt: "Qué revisar antes de una entrega grande.",
                body: "<p>Checklist completo para entregas.</p>",
                keywords: ["logistica"],
                category: {
                  category_id: "cat-2",
                  name: "Operaciones",
                  slug: "operaciones",
                },
                header_image_id: null,
                hero_image_id: null,
                status: "published",
                published_at: "2026-04-15T10:00:00+00:00",
                created_at: "2026-04-15T10:00:00+00:00",
                updated_at: "2026-04-15T10:00:00+00:00",
              },
            ]
          : [
              {
                post_id: "post-1",
                title: "Cómo alquilar un taladro sin sorpresas",
                slug: "como-alquilar-un-taladro",
                excerpt: "Guía rápida para revisar estado, fianza y disponibilidad.",
                body: "<p>Checklist útil para alquilar herramientas.</p>",
                keywords: ["taladro", "alquiler"],
                category: {
                  category_id: "cat-1",
                  name: "Guías",
                  slug: "guias",
                },
                header_image_id: null,
                hero_image_id: null,
                status: "published",
                published_at: "2026-04-20T09:00:00+00:00",
                created_at: "2026-04-20T09:00:00+00:00",
                updated_at: "2026-04-20T09:00:00+00:00",
              },
            ],
        total: 11,
        page: Number(currentPage),
      }),
    });
  });

  await page.route("**/api/blog/posts/como-alquilar-un-taladro", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          post_id: "post-1",
          title: "Cómo alquilar un taladro sin sorpresas",
          slug: "como-alquilar-un-taladro",
          excerpt: "Guía rápida para revisar estado, fianza y disponibilidad.",
          body: "<p>Checklist útil para alquilar herramientas.</p>",
          keywords: ["taladro", "alquiler"],
          category: {
            category_id: "cat-1",
            name: "Guías",
            slug: "guias",
          },
          header_image_id: null,
          hero_image_id: null,
          status: "published",
          published_at: "2026-04-20T09:00:00+00:00",
          created_at: "2026-04-20T09:00:00+00:00",
          updated_at: "2026-04-20T09:00:00+00:00",
        },
      }),
    });
  });

  await page.goto("/blog");

  await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible();
  await expect(page.getByText("Cómo alquilar un taladro sin sorpresas")).toBeVisible();
  await expect(page.getByText("Página 1 de 2")).toBeVisible();

  await page.getByRole("button", { name: "Siguiente" }).click();
  await expect(page.getByText("Página 2 de 2")).toBeVisible();
  await expect(page.getByText("Logística para alquilar mobiliario")).toBeVisible();

  await page.goto("/blog/como-alquilar-un-taladro");

  await expect(
    page.getByRole("heading", { name: "Cómo alquilar un taladro sin sorpresas" })
  ).toBeVisible();
  await expect(page.getByText("Guías")).toBeVisible();
  await expect(page.getByText("Checklist útil para alquilar herramientas.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Volver al blog" })).toBeVisible();
});
