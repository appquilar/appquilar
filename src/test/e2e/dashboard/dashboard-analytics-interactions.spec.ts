import { expect, test } from "./fixtures";

test.describe("Dashboard Analytics Interactions", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ seed, request, page }) => {
    await seed.reset(request);
    await seed.clearToken(page);
  });

  test("admin overview links into the platform analytics detail tabs", async ({ page, request, seed }) => {
    await seed.loginAs(page, request, "admin");

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard(?:\?.*)?$/);
    await expect(page.getByText("Restaurando tu sesion...")).toHaveCount(0, { timeout: 15000 });
    await expect(page.getByText("Señales rápidas de plataforma para admins.")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText("Resumen ejecutivo")).toBeVisible();

    await page.getByRole("link", { name: "Ver analítica completa" }).click();
    await expect(page).toHaveURL(/\/dashboard\/platform-analytics$/);
    await expect(page.getByRole("heading", { name: "Analítica de plataforma" })).toBeVisible();

    await page.getByRole("tab", { name: "Marketplace" }).click();
    await expect(page.getByText("Oferta y demanda por categoría")).toBeVisible();

    await page.getByRole("tab", { name: "Monetización" }).click();
    await expect(page.getByText("Uso de capacidad del plan")).toBeVisible();

    await page.getByRole("tab", { name: "Calidad y riesgo" }).click();
    await expect(page.getByText("Productos sin imagen")).toBeVisible();
  });

  test("platform admin company page renders company stats and premium insights", async ({
    page,
    request,
    seed,
  }) => {
    await seed.loginAs(page, request, "admin");

    await page.goto("/dashboard");
    await expect(page.getByText("Restaurando tu sesion...")).toHaveCount(0, { timeout: 15000 });
    await page.goto("/dashboard/companies/company-1");
    await expect(page.getByText("Mi empresa")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Estadísticas de empresa")).toBeVisible();
    await expect(page.getByText("Desglose por producto")).toBeVisible();
    await expect(page.getByText("Rendimiento comercial")).toBeVisible();
  });
});
