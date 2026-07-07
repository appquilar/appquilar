import { expect, test, type Page, type SeedRole } from "./fixtures";

type CoverageRole = SeedRole | "anonymous";

type RouteExpectation =
  | {
      kind: "heading";
      name: string | RegExp;
      exact?: boolean;
      level?: number;
      timeout?: number;
    }
  | {
      kind: "text";
      text: string | RegExp;
      exact?: boolean;
      timeout?: number;
    }
  | {
      kind: "button";
      name: string | RegExp;
      timeout?: number;
    }
  | {
      kind: "locator";
      selector: string;
      timeout?: number;
    }
  | {
      kind: "url";
      matches: RegExp;
    };

type CoverageRoute = {
  path: string;
  role: CoverageRole;
  expects: RouteExpectation[];
};

const routes: CoverageRoute[] = [
  {
    role: "anonymous",
    path: "/",
    expects: [{ kind: "heading", name: /La Forma Inteligente de Alquilar/i }],
  },
  {
    role: "anonymous",
    path: "/search?q=taladro",
    expects: [
      { kind: "heading", name: "Buscar productos" },
      { kind: "text", text: "Taladro percutor 18V" },
    ],
  },
  {
    role: "anonymous",
    path: "/categories",
    expects: [
      { kind: "url", matches: /\/categorias$/ },
      { kind: "heading", name: "Todas las categorías" },
    ],
  },
  {
    role: "anonymous",
    path: "/category/herramientas",
    expects: [
      { kind: "url", matches: /\/categoria\/herramientas$/ },
      { kind: "heading", name: "Herramientas" },
    ],
  },
  {
    role: "anonymous",
    path: "/product/taladro-percutor-18v",
    expects: [
      { kind: "url", matches: /\/producto\/taladro-percutor-18v$/ },
      { kind: "heading", name: "Taladro percutor 18V" },
      { kind: "text", text: "Herramientas Norte" },
    ],
  },
  {
    role: "anonymous",
    path: "/about",
    expects: [
      { kind: "url", matches: /\/quienes-somos$/ },
      { kind: "heading", name: "Quiénes somos" },
    ],
  },
  {
    role: "anonymous",
    path: "/contact",
    expects: [
      { kind: "url", matches: /\/contacto$/ },
      { kind: "heading", name: "Contacto" },
    ],
  },
  {
    role: "anonymous",
    path: "/partners",
    expects: [
      { kind: "url", matches: /\/colabora-con-nosotros$/ },
      { kind: "heading", name: "Colabora con nosotros" },
    ],
  },
  { role: "anonymous", path: "/blog", expects: [{ kind: "heading", name: "Blog" }] },
  {
    role: "anonymous",
    path: "/legal/aviso-legal",
    expects: [{ kind: "heading", name: "Aviso Legal" }],
  },
  {
    role: "anonymous",
    path: "/legal/terminos",
    expects: [{ kind: "heading", name: "Términos y Condiciones" }],
  },
  {
    role: "anonymous",
    path: "/legal/cookies",
    expects: [{ kind: "heading", name: "Política de Cookies" }],
  },
  {
    role: "anonymous",
    path: "/legal/privacidad",
    expects: [{ kind: "heading", name: "Política de Privacidad" }],
  },
  {
    role: "anonymous",
    path: "/dashboard",
    expects: [
      { kind: "url", matches: /\/$/ },
      { kind: "locator", selector: "[data-trigger-login]:visible" },
    ],
  },
  {
    role: "admin",
    path: "/dashboard",
    expects: [
      { kind: "heading", name: "Resumen", exact: true },
      { kind: "text", text: "Señales rápidas de plataforma para admins." },
    ],
  },
  { role: "admin", path: "/dashboard/products", expects: [{ kind: "heading", name: "Productos" }] },
  {
    role: "admin",
    path: "/dashboard/products/new",
    expects: [{ kind: "heading", name: "Añadir Nuevo Producto" }],
  },
  { role: "admin", path: "/dashboard/rentals", expects: [{ kind: "heading", name: "Alquileres" }] },
  {
    role: "admin",
    path: "/dashboard/rentals/new",
    expects: [{ kind: "heading", name: "Crear Nuevo Alquiler" }],
  },
  {
    role: "admin",
    path: "/dashboard/rentals/rent-1",
    expects: [
      { kind: "heading", name: "Estado y acciones", timeout: 15000 },
      { kind: "text", text: "Deal room", exact: true },
    ],
  },
  {
    role: "admin",
    path: "/dashboard/messages?rent_id=rent-3",
    expects: [
      { kind: "heading", name: "Mensajes" },
      { kind: "text", text: /Conversaci[oó]n del alquiler/ },
    ],
  },
  { role: "admin", path: "/dashboard/config", expects: [{ kind: "heading", name: "Configuración" }] },
  { role: "admin", path: "/dashboard/users", expects: [{ kind: "heading", name: "Usuarios" }] },
  {
    role: "admin",
    path: "/dashboard/users/33333333-3333-4333-8333-333333333333",
    expects: [{ kind: "heading", name: "Editar usuario: Uri User" }],
  },
  {
    role: "admin",
    path: "/dashboard/companies",
    expects: [{ kind: "heading", name: "Empresas", exact: true }],
  },
  {
    role: "admin",
    path: "/dashboard/companies/company-1",
    expects: [
      { kind: "heading", name: "Mi empresa" },
      { kind: "text", text: "Herramientas Norte" },
    ],
  },
  {
    role: "admin",
    path: "/dashboard/companies/company-1/users",
    expects: [
      { kind: "heading", name: "Usuarios de la empresa" },
      { kind: "text", text: "company.admin.e2e@appquilar.test" },
    ],
  },
  { role: "admin", path: "/dashboard/categories", expects: [{ kind: "heading", name: "Categorías" }] },
  {
    role: "admin",
    path: "/dashboard/categories/new",
    expects: [{ kind: "heading", name: "Crear Categoría" }],
  },
  {
    role: "admin",
    path: "/dashboard/categories/cat-1",
    expects: [
      { kind: "heading", name: "Editar Categoría" },
      { kind: "text", text: "Herramientas" },
    ],
  },
  {
    role: "admin",
    path: "/dashboard/blog",
    expects: [{ kind: "heading", level: 1, name: "Blog" }],
  },
  {
    role: "admin",
    path: "/dashboard/blog/new",
    expects: [{ kind: "heading", name: "Nuevo post" }],
  },
  { role: "admin", path: "/dashboard/sites", expects: [{ kind: "heading", name: "Sitio" }] },
  {
    role: "admin",
    path: "/dashboard/platform-analytics",
    expects: [{ kind: "heading", name: "Analítica de plataforma" }],
  },
  { role: "company_admin", path: "/dashboard", expects: [{ kind: "heading", name: "Resumen" }] },
  { role: "company_admin", path: "/dashboard/products", expects: [{ kind: "heading", name: "Productos" }] },
  {
    role: "company_admin",
    path: "/dashboard/rentals",
    expects: [{ kind: "heading", name: "Alquileres" }],
  },
  {
    role: "company_admin",
    path: "/dashboard/rentals/rent-1",
    expects: [
      { kind: "heading", name: "Estado y acciones", timeout: 15000 },
      { kind: "text", text: "Deal room", exact: true },
    ],
  },
  {
    role: "company_admin",
    path: "/dashboard/messages",
    expects: [
      { kind: "heading", name: "Mensajes" },
      { kind: "button", name: /Taladro percutor 18V/i },
    ],
  },
  {
    role: "company_admin",
    path: "/dashboard/config",
    expects: [{ kind: "heading", name: "Configuración" }],
  },
  {
    role: "company_admin",
    path: "/dashboard/companies/company-1",
    expects: [
      { kind: "heading", name: "Mi empresa" },
      { kind: "text", text: "Herramientas Norte" },
    ],
  },
  {
    role: "company_admin",
    path: "/dashboard/companies/company-1/users",
    expects: [
      { kind: "heading", name: "Usuarios de la empresa" },
      { kind: "text", text: "company.admin.e2e@appquilar.test" },
    ],
  },
  {
    role: "company_admin",
    path: "/dashboard/platform-analytics",
    expects: [
      { kind: "url", matches: /\/dashboard$/ },
      { kind: "heading", name: "Resumen" },
    ],
  },
  {
    role: "company_admin",
    path: "/dashboard/upgrade",
    expects: [{ kind: "heading", name: "Actualizar a Cuenta de Empresa" }],
  },
  { role: "user", path: "/dashboard", expects: [{ kind: "heading", name: "Resumen" }] },
  { role: "user", path: "/dashboard/products", expects: [{ kind: "heading", name: "Productos" }] },
  { role: "user", path: "/dashboard/rentals", expects: [{ kind: "heading", name: "Alquileres" }] },
  { role: "user", path: "/dashboard/messages", expects: [{ kind: "heading", name: "Mensajes" }] },
  {
    role: "user",
    path: "/dashboard/config?tab=address",
    expects: [
      { kind: "heading", name: "Configuración" },
      { kind: "text", text: "Dirección" },
    ],
  },
  {
    role: "user",
    path: "/dashboard/platform-analytics",
    expects: [
      { kind: "url", matches: /\/dashboard$/ },
      { kind: "heading", name: "Resumen" },
    ],
  },
  {
    role: "user",
    path: "/dashboard/upgrade",
    expects: [{ kind: "heading", name: "Actualizar a Cuenta de Empresa" }],
  },
];

const assertRouteExpectation = async (page: Page, expectation: RouteExpectation) => {
  if (expectation.kind === "url") {
    await expect(page).toHaveURL(expectation.matches);
    return;
  }

  if (expectation.kind === "heading") {
    await expect(
      page.getByRole("heading", {
        name: expectation.name,
        exact: typeof expectation.name === "string" ? expectation.exact ?? true : expectation.exact,
        level: expectation.level,
      })
    ).toBeVisible({ timeout: expectation.timeout });
    return;
  }

  if (expectation.kind === "text") {
    await expect(
      page.getByText(expectation.text, { exact: expectation.exact }).first()
    ).toBeVisible({ timeout: expectation.timeout });
    return;
  }

  if (expectation.kind === "button") {
    await expect(page.getByRole("button", { name: expectation.name }).first()).toBeVisible({
      timeout: expectation.timeout,
    });
    return;
  }

  await expect(page.locator(expectation.selector)).toBeVisible({ timeout: expectation.timeout });
};

test.describe("Dashboard Coverage Routes", () => {
  test.describe.configure({ mode: "serial" });

  for (const route of routes) {
    test(`${route.role} explores ${route.path}`, async ({ page, request, seed }) => {
      await seed.reset(request);
      await seed.clearToken(page);

      if (route.role !== "anonymous") {
        await seed.loginAs(page, request, route.role);
      }

      await page.goto(route.path, { waitUntil: "domcontentloaded", timeout: 15000 });
      for (const expectation of route.expects) {
        await assertRouteExpectation(page, expectation);
      }
    });
  }
});
