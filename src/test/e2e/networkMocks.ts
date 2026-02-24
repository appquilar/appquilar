import type { Page, Route } from "@playwright/test";

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });

const sitePayload = {
  success: true,
  data: {
    site_id: "test-site",
    name: "Appquilar",
    title: "Appquilar",
    url: "http://localhost:4173",
    description: "Marketplace",
    category_ids: ["cat-1", "cat-2", "cat-3", "cat-4"],
    menu_category_ids: ["cat-1", "cat-2", "cat-3", "cat-4"],
    featured_category_ids: ["cat-1", "cat-2", "cat-3", "cat-4"],
  },
};

const categoriesPayload = {
  data: [
    { id: "cat-1", name: "Vehículos", slug: "vehiculos", parent_id: null },
    { id: "cat-2", name: "Bicicletas", slug: "bicicletas", parent_id: null },
    { id: "cat-3", name: "Patinetes", slug: "patinetes", parent_id: null },
    { id: "cat-4", name: "Accesorios", slug: "accesorios", parent_id: null },
  ],
  total: 4,
  page: 1,
  per_page: 50,
};

const productsPayload = {
  success: true,
  data: {
    data: [
      {
        id: "product-1",
        internal_id: "P-001",
        name: "Taladro profesional",
        slug: "taladro-profesional",
        description: "Taladro",
        publication_status: "published",
        image_ids: [],
        deposit: { amount: 15000, currency: "EUR" },
        tiers: [{ days_from: 1, days_to: 5, price_per_day: { amount: 900, currency: "EUR" } }],
        categories: [{ id: "cat-1", name: "Vehículos", slug: "vehiculos" }],
        owner_data: {
          owner_id: "company-1",
          type: "company",
          name: "Alquileres Norte",
        },
      },
      {
        id: "product-2",
        internal_id: "P-002",
        name: "Bicicleta eléctrica",
        slug: "bicicleta-electrica",
        description: "Bicicleta",
        publication_status: "published",
        image_ids: [],
        deposit: { amount: 30000, currency: "EUR" },
        tiers: [{ days_from: 1, days_to: 5, price_per_day: { amount: 1800, currency: "EUR" } }],
        categories: [{ id: "cat-2", name: "Bicicletas", slug: "bicicletas" }],
        owner_data: {
          owner_id: "company-1",
          type: "company",
          name: "Alquileres Norte",
        },
      },
    ],
    total: 2,
    page: 1,
  },
};

const meUnauthorizedPayload = {
  success: false,
  error: ["auth.unauthorized"],
};

export const registerNetworkMocks = async (page: Page): Promise<void> => {
  await page.route("**/*", async (route) => {
    const url = route.request().url();

    if (
      url.startsWith("data:") ||
      url.startsWith("blob:") ||
      url.includes("127.0.0.1:4173") ||
      url.includes("localhost:4173") ||
      url.includes("localhost:8000") ||
      url.includes("127.0.0.1:8000")
    ) {
      await route.continue();
      return;
    }

    await route.abort();
  });

  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;

    if (path.startsWith("/api/sites/")) {
      await json(route, sitePayload);
      return;
    }

    if (path === "/api/categories") {
      await json(route, categoriesPayload);
      return;
    }

    if (path === "/api/products/search") {
      await json(route, productsPayload);
      return;
    }

    if (path === "/api/me") {
      await json(route, meUnauthorizedPayload, 401);
      return;
    }

    if (path === "/api/auth/login") {
      await json(route, {
        success: true,
        data: {
          token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEiLCJyb2xlcyI6WyJST0xFX1VTRVIiXSwiZXhwIjo0MTAyNDQ0ODAwfQ.signature",
        },
      });
      return;
    }

    if (path === "/api/auth/register") {
      await json(route, { success: true }, 201);
      return;
    }

    if (path === "/api/auth/forgot-password") {
      await json(route, { success: true }, 200);
      return;
    }

    await json(route, { success: true, data: null }, 200);
  });
};
