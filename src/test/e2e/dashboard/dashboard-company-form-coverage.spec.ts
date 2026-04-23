import { expect, test, type Page } from "./fixtures";

const jsonHeaders = { "content-type": "application/json" };

const installPopupHarness = async (page: Page): Promise<void> => {
  await page.evaluate(() => {
    const state = {
      lastHref: "about:blank",
    };

    (window as typeof window & { __e2ePopupState?: typeof state }).__e2ePopupState = state;

    window.open = () =>
      ({
        opener: null,
        location: {
          get href() {
            return state.lastHref;
          },
          set href(value: string) {
            state.lastHref = String(value);
          },
        },
        close() {
          return undefined;
        },
      }) as unknown as Window;
  });
};

const getPopupHref = async (page: Page): Promise<string> => {
  return page.evaluate(() => {
    return (
      (window as typeof window & {
        __e2ePopupState?: { lastHref: string };
      }).__e2ePopupState?.lastHref ?? ""
    );
  });
};

test.describe("Dashboard Company Form Coverage", () => {
  test.beforeEach(async ({ seed, request, page }) => {
    await seed.reset(request);
    await seed.clearToken(page);
  });

  test("company admin can open subscription management and save company contact data", async ({
    page,
    request,
    seed,
  }) => {
    await seed.loginAs(page, request, "company_admin");

    let savedPayload: Record<string, unknown> | null = null;

    await page.route("**/api/billing/customer-portal-session", async (route) => {
      await route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          success: true,
          data: { url: "https://example.test/company-portal-company-form" },
        }),
      });
    });

    await page.route("**/api/companies/company-1", async (route) => {
      if (route.request().method() !== "PATCH") {
        await route.continue();
        return;
      }

      savedPayload = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({ status: 204 });
    });

    await page.goto("/dashboard");
    await expect(page.getByRole("link", { name: "Empresa" })).toBeVisible();
    await page.getByRole("link", { name: "Empresa" }).click();
    await expect(page).toHaveURL(/\/dashboard\/companies\/company-1/);
    await expect(page.getByRole("heading", { name: "Mi empresa" })).toBeVisible();
    await expect(page.getByText("Suscripcion de empresa")).toBeVisible();

    await installPopupHarness(page);
    await page.getByRole("button", { name: "Gestionar suscripcion" }).click();
    await expect.poll(() => getPopupHref(page)).toBe("https://example.test/company-portal-company-form");

    const phoneInput = page.getByLabel("Número de teléfono");
    await phoneInput.clear();
    await phoneInput.fill("123");
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page.getByText("Debe ser un número de teléfono válido")).toBeVisible();

    await phoneInput.clear();
    await phoneInput.fill("637493915");
    await page.getByRole("button", { name: "Guardar cambios" }).click();

    await expect.poll(() => savedPayload).not.toBeNull();
    await expect(page.getByText("Empresa actualizada correctamente.")).toBeVisible();

    expect(savedPayload).toMatchObject({
      phone_number_country_code: "ES",
      phone_number_prefix: "+34",
      phone_number_number: "637493915",
    });
  });
});
