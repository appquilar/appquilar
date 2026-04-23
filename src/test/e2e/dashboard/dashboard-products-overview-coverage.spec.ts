import { expect, test, type Page } from "./fixtures";

const jsonHeaders = { "content-type": "application/json" };

const mutateCurrentUserPayload = async (
  page: Page,
  mutate: (data: Record<string, unknown>) => Record<string, unknown> | void
) => {
  await page.route("**/api/me", async (route) => {
    const response = await route.fetch();
    const payload = await response.json();
    const currentData = payload?.data && typeof payload.data === "object" ? { ...payload.data } : {};
    const nextData = mutate(currentData) ?? currentData;

    await route.fulfill({
      status: response.status(),
      headers: jsonHeaders,
      body: JSON.stringify({
        ...payload,
        data: nextData,
      }),
    });
  });
};

const buildCompanyProduct = (index: number) => ({
  id: `product-${index}`,
  internal_id: `CP-${String(index).padStart(3, "0")}`,
  name: `Compresor ${index}`,
  slug: `compresor-${index}`,
  description: `Compresor industrial ${index}`,
  publication_status: index === 12 ? "archived" : "published",
  image_ids: [],
  categories: [{ id: "cat-1", name: "Herramientas", slug: "herramientas" }],
  owner_data: {
    owner_id: "company-1",
    type: "company",
    name: "Herramientas Norte",
  },
});

const overviewPayload = {
  success: true,
  data: {
    company_id: "company-1",
    period: {
      from: "2026-03-22",
      to: "2026-04-20",
    },
    summary: {
      total_views: 140,
      unique_visitors: 90,
      repeat_visitors: 25,
      repeat_visitor_ratio: 0.277,
      logged_views: 55,
      anonymous_views: 85,
      messages_total: 17,
      message_threads: 8,
      message_to_rental_ratio: 0.25,
      average_first_response_minutes: 14,
    },
    top_locations: [
      {
        country: "España",
        region: "Madrid",
        city: "Madrid",
        total_views: 42,
        unique_visitors: 25,
      },
    ],
    series: {
      daily_views: [
        { day: "2026-04-18", views: 18 },
        { day: "2026-04-19", views: 22 },
        { day: "2026-04-20", views: 25 },
      ],
      daily_messages: [
        { day: "2026-04-18", messages: 2 },
        { day: "2026-04-19", messages: 3 },
        { day: "2026-04-20", messages: 4 },
      ],
    },
    by_product: Array.from({ length: 9 }, (_, index) => ({
      product_id: `overview-${index + 1}`,
      product_name: `Resumen ${index + 1}`,
      product_slug: `resumen-${index + 1}`,
      product_internal_id: `OV-${String(index + 1).padStart(3, "0")}`,
      total_views: 100 - index,
      unique_visitors: 90 - index,
      logged_views: 40 - index,
      anonymous_views: 50 - index,
      messages_total: 20 - index,
      message_threads: 9 - Math.min(index, 8),
      visit_to_message_ratio: 0.4 - index * 0.01,
      message_to_rental_ratio: 0.2 - index * 0.01,
    })),
    opportunities: {
      high_interest_low_conversion: {
        product_id: "overview-1",
        product_name: "Resumen 1",
        product_slug: "resumen-1",
        product_internal_id: "OV-001",
        total_views: 100,
        unique_visitors: 90,
        logged_views: 40,
        anonymous_views: 50,
        messages_total: 20,
        message_threads: 9,
        visit_to_message_ratio: 0.4,
        message_to_rental_ratio: 0.2,
      },
    },
  },
};

test.describe("Dashboard products and overview coverage", () => {
  test.beforeEach(async ({ seed, request, page }) => {
    await seed.reset(request);
    await seed.clearToken(page);
  });

  test("company admin paginates and filters the dashboard products list", async ({
    page,
    request,
    seed,
  }) => {
    await seed.loginAs(page, request, "company_admin");

    const products = Array.from({ length: 12 }, (_, index) => buildCompanyProduct(index + 1));

    await page.route("**/api/companies/company-1/products?**", async (route) => {
      const url = new URL(route.request().url());
      const pageNumber = Number(url.searchParams.get("page") ?? "1");
      const perPage = Number(url.searchParams.get("per_page") ?? "10");
      const nameFilter = (url.searchParams.get("name") ?? "").toLowerCase();
      const internalIdFilter = (url.searchParams.get("internalId") ?? "").toLowerCase();

      const filteredProducts = products.filter((product) => {
        const matchesName = nameFilter.length === 0 || product.name.toLowerCase().includes(nameFilter);
        const matchesInternalId =
          internalIdFilter.length === 0 || product.internal_id.toLowerCase().includes(internalIdFilter);

        return matchesName && matchesInternalId;
      });

      const start = (pageNumber - 1) * perPage;
      const pageProducts = filteredProducts.slice(start, start + perPage);

      await route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            data: pageProducts,
            total: filteredProducts.length,
            page: pageNumber,
            per_page: perPage,
          },
        }),
      });
    });

    await page.goto("/dashboard/products");
    await expect(page.getByRole("heading", { name: "Productos" })).toBeVisible();

    await expect(page.getByRole("heading", { name: "Compresor 1", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Compresor 10", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Compresor 11", exact: true })).toHaveCount(0);

    await page.locator("a[aria-label='Go to next page']").click();
    await expect(page.getByRole("heading", { name: "Compresor 11", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Compresor 12", exact: true })).toBeVisible();

    await page.getByPlaceholder("ID Interno...").fill("CP-012");
    await expect(page.getByRole("heading", { name: "Compresor 12", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Compresor 11", exact: true })).toHaveCount(0);

    await page.getByTitle("Limpiar filtros").click();
    await page.getByPlaceholder("Nombre...").fill("sin resultados");
    await expect(page.getByText("No hay productos para mostrar")).toBeVisible();
  });

  test("company admin uses quick ranges and drills into the overview product breakdown", async ({
    page,
    request,
    seed,
  }) => {
    await seed.loginAs(page, request, "company_admin");

    await mutateCurrentUserPayload(page, (data) => {
      data.company_context = {
        ...(typeof data.company_context === "object" && data.company_context ? data.company_context : {}),
        company_id: "company-1",
        company_name: "Herramientas Norte",
        company_role: "ROLE_ADMIN",
        is_company_owner: true,
        plan_type: "pro",
        subscription_status: "active",
        is_founding_account: false,
        product_slot_limit: 30,
        capabilities: {
          advanced_analytics: { state: "enabled" },
          api_access: { state: "enabled" },
        },
      };

      return data;
    });

    await page.route("**/api/companies/company-1/stats/engagement?**", async (route) => {
      await route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify(overviewPayload),
      });
    });

    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Resumen" })).toBeVisible();
    await expect(
      page.locator(".ui-card").filter({ has: page.getByText("Visitas únicas") }).first()
    ).toContainText("90");
    await expect(page.getByRole("link", { name: /Resumen 1/i }).first()).toBeVisible();
    await expect(page.getByText("Madrid, Madrid, España")).toBeVisible();

    await page.getByRole("button", { name: "7D" }).click();
    await expect(page.getByText("7 días")).toBeVisible();

    await page.getByRole("button", { name: "Siguiente" }).click();
    await expect(page.getByText("Página 2 de 2")).toBeVisible();
    await expect(page.getByText("Resumen 9")).toBeVisible();

    await page.getByPlaceholder("Buscar por nombre o ID interno...").fill("OV-009");
    await expect(page.getByRole("link", { name: /Resumen 9/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Resumen 1/i })).toHaveCount(0);
  });

  test("explorer overview handles checkout failures and then redirects to the in-app success URL", async ({
    page,
    request,
    seed,
  }, testInfo) => {
    testInfo.annotations.push({
      type: "skipCoverageExploration",
      description: "The overview checkout CTA already lands on an asserted terminal state.",
    });

    await seed.loginAs(page, request, "user");

    let checkoutAttempts = 0;
    await page.route("**/api/billing/checkout-session", async (route) => {
      checkoutAttempts += 1;

      if (checkoutAttempts === 1) {
        await route.fulfill({
          status: 500,
          headers: jsonHeaders,
          body: JSON.stringify({
            success: false,
            error: ["billing.checkout.unavailable"],
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            url: "http://127.0.0.1:4173/dashboard/config?checkout=ok",
          },
        }),
      });
    });

    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Resumen" })).toBeVisible();
    await expect(page.getByText("Ventajas de User Pro")).toBeVisible();

    await page.getByRole("button", { name: "Hazte User Pro" }).click();
    await expect(page.getByText("billing.checkout.unavailable")).toBeVisible();

    await page.getByRole("button", { name: "Hazte User Pro" }).click();
    await expect(page).toHaveURL(/\/dashboard\/config\?checkout=ok$/);
  });

  test("company overview supports product sorting toggles and the empty filtered breakdown state", async ({
    page,
    request,
    seed,
  }) => {
    await seed.loginAs(page, request, "company_admin");

    await mutateCurrentUserPayload(page, (data) => {
      data.company_context = {
        ...(typeof data.company_context === "object" && data.company_context ? data.company_context : {}),
        company_id: "company-1",
        company_name: "Herramientas Norte",
        company_role: "ROLE_ADMIN",
        is_company_owner: true,
        plan_type: "pro",
        subscription_status: "active",
        is_founding_account: false,
        product_slot_limit: 30,
        capabilities: {
          advanced_analytics: { state: "enabled" },
          api_access: { state: "enabled" },
        },
      };

      return data;
    });

    await page.route("**/api/companies/company-1/stats/engagement?**", async (route) => {
      await route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify(overviewPayload),
      });
    });

    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Resumen" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Resumen 1/i }).first()).toBeVisible();

    await page.getByRole("button", { name: /^Producto$/ }).click();
    await expect(page.getByRole("link", { name: /Resumen 1/i }).first()).toBeVisible();

    await page.getByRole("button", { name: /^Producto$/ }).click();
    await expect(page.getByRole("link", { name: /Resumen 9/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Resumen 1/i })).toHaveCount(0);

    await page.getByPlaceholder("Buscar por nombre o ID interno...").fill("sin coincidencias");
    await expect(page.getByText("Sin datos de productos para el período.")).toBeVisible();
  });
});
