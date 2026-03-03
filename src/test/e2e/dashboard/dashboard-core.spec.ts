import { test, expect } from "./fixtures";

test.describe("Dashboard Core (seeded API)", () => {
  test.beforeEach(async ({ seed, request, page }) => {
    await seed.reset(request);
    await seed.clearToken(page);
  });

  test("redirects unauthenticated users from /dashboard to public home", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: /La Forma Inteligente de Alquilar/i })).toBeVisible();
  });

  test("admin can access overview and admin-only sections", async ({ page, request, seed }) => {
    await seed.loginAs(page, request, "admin");

    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Resumen" })).toBeVisible();

    await page.goto("/dashboard/users");
    await expect(page).toHaveURL(/\/dashboard\/users$/);
    await expect(page.getByRole("heading", { name: "Usuarios" })).toBeVisible();

    await page.goto("/dashboard/companies");
    await expect(page).toHaveURL(/\/dashboard\/companies$/);
    await expect(page.getByRole("heading", { name: "Empresas", exact: true })).toBeVisible();

    await page.goto("/dashboard/sites");
    await expect(page).toHaveURL(/\/dashboard\/sites$/);
    await expect(page.getByRole("heading", { name: "Sitio" })).toBeVisible();

    await page.goto("/dashboard/categories");
    await expect(page).toHaveURL(/\/dashboard\/categories$/);
    await expect(page.getByRole("heading", { name: "Categorías" })).toBeVisible();

    await page.goto("/dashboard/blog");
    await expect(page).toHaveURL(/\/dashboard\/blog$/);
    await expect(page.getByRole("heading", { level: 1, name: "Blog" })).toBeVisible();
  });

  test("admin can search users and companies", async ({ page, request, seed }) => {
    await seed.loginAs(page, request, "admin");

    await page.goto("/dashboard/users");
    await page.getByPlaceholder("Nombre o apellidos").fill("Ada");
    await page.getByRole("button", { name: "Buscar" }).click();
    await expect(
      page.getByRole("cell", { name: "admin.e2e@appquilar.test", exact: true })
    ).toBeVisible();

    await page.goto("/dashboard/companies");
    await page.getByPlaceholder("Buscar por nombre").fill("Herramientas");
    await page.getByRole("button", { name: "Buscar" }).click();
    await expect(page.getByText("Herramientas Norte")).toBeVisible();
  });

  test("company admin is redirected when trying admin-only pages", async ({ page, request, seed }) => {
    await seed.loginAs(page, request, "company_admin");

    await page.goto("/dashboard/users");
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Resumen" })).toBeVisible();

    await page.goto("/dashboard/sites");
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.goto("/dashboard/categories");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("company admin can use rentals flow and open details", async ({ page, request, seed }) => {
    await seed.loginAs(page, request, "company_admin");

    await page.goto("/dashboard/rentals");
    await expect(page.getByRole("heading", { name: "Alquileres" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Taladro percutor 18V" }).first()).toBeVisible();

    await page.getByRole("button", { name: "Ver detalles" }).first().click();
    await expect(page).toHaveURL(/\/dashboard\/rentals\/rent-/);
    await expect(page.getByRole("heading", { level: 1, name: "Detalles del Alquiler" })).toBeVisible();

    await page.getByRole("button", { name: "Ver mensajes" }).click();
    await expect(page).toHaveURL(/\/dashboard\/messages\?rent_id=/);
    await expect(page.getByRole("heading", { name: "Mensajes" })).toBeVisible();
  });

  test("company admin can view conversations and open one thread", async ({ page, request, seed }) => {
    await seed.loginAs(page, request, "company_admin");

    await page.goto("/dashboard/messages");
    await expect(page.getByRole("heading", { name: "Mensajes" })).toBeVisible();

    await page.getByRole("button", { name: /Taladro percutor 18V/i }).first().click();
    await expect(page.getByText("Conversacion del alquiler")).toBeVisible();
  });

  test("regular user can access personal configuration but not admin pages", async ({ page, request, seed }) => {
    await seed.loginAs(page, request, "user");

    await page.goto("/dashboard/config");
    await expect(page).toHaveURL(/\/dashboard\/config$/);
    await expect(page.getByRole("heading", { name: "Configuración" })).toBeVisible();

    await page.goto("/dashboard/blog");
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Resumen" })).toBeVisible();
  });
});
