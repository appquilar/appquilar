import { expect, test } from "./fixtures";

const jsonHeaders = { "content-type": "application/json" };

test.describe("Dashboard billing return sync", () => {
  test.beforeEach(async ({ seed, request, page }) => {
    await seed.reset(request);
    await seed.clearToken(page);
  });

  test("checkout returns synchronize the session and strip billing params after the user plan updates", async ({
    page,
    request,
    seed,
  }) => {
    await seed.loginAs(page, request, "user");

    let syncPayload: Record<string, unknown> | null = null;

    await page.route("**/api/billing/checkout-session/sync", async (route) => {
      syncPayload = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            synchronized: true,
          },
        }),
      });
    });

    await page.goto(
      "/dashboard/config?foo=bar&aq_billing_sync=1&aq_billing_scope=user&session_id=cs_test_sync"
    );

    await expect(page.getByRole("heading", { name: "Configuración" })).toBeVisible();
    await expect.poll(() => syncPayload).not.toBeNull();
    expect(syncPayload).toMatchObject({
      scope: "user",
      session_id: "cs_test_sync",
    });
    await expect(page).toHaveURL(/\/dashboard\/config\?foo=bar$/);
  });

  test("portal returns keep refreshing until the observed subscription state changes", async ({
    page,
    request,
    seed,
  }) => {
    await seed.loginAs(page, request, "user");

    let meCalls = 0;
    let syncCalls = 0;

    await page.route("**/api/me", async (route) => {
      meCalls += 1;
      const response = await route.fetch();
      const payload = await response.json();

      if (payload?.data) {
        payload.data.plan_type = meCalls >= 2 ? "explorer" : "user_pro";
        payload.data.subscription_status = "active";
        payload.data.company_context = null;
      }

      await route.fulfill({
        status: response.status(),
        headers: jsonHeaders,
        body: JSON.stringify(payload),
      });
    });

    await page.route("**/api/billing/checkout-session/sync", async (route) => {
      syncCalls += 1;
      await route.continue();
    });

    await page.goto(
      "/dashboard/config?aq_billing_sync=1&aq_billing_scope=user&aq_billing_current_plan=user_pro&aq_billing_current_status=active"
    );

    await expect(page.getByRole("heading", { name: "Configuración" })).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard\/config$/);
    expect(syncCalls).toBe(0);
  });
});
