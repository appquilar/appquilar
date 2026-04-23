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

const productDetailPayload = {
  success: true,
  data: {
    id: "product-1",
    internal_id: "P-001",
    name: "Taladro profesional",
    slug: "taladro-profesional",
    description: "Taladro para obra y reformas.",
    publication_status: "published",
    is_rental_enabled: true,
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
};

const publicCompanyProfilePayload = {
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
  },
};

const publicCompanyProductsPayload = {
  success: true,
  total: 1,
  page: 1,
  data: [
    {
      id: "product-1",
      internal_id: "P-001",
      name: "Taladro profesional",
      slug: "taladro-profesional",
      description: "Taladro",
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

    if (path === "/api/products/taladro-profesional") {
      await json(route, productDetailPayload);
      return;
    }

    if (path === "/api/public/companies/alquileres-norte") {
      await json(route, publicCompanyProfilePayload);
      return;
    }

    if (path === "/api/public/companies/alquileres-norte/products") {
      await json(route, publicCompanyProductsPayload);
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
