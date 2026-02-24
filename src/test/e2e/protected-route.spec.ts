import { expect, test } from "@playwright/test";
import { registerNetworkMocks } from "./networkMocks";

test.beforeEach(async ({ page }) => {
  await registerNetworkMocks(page);
});

test("unauthenticated user is redirected from dashboard to home", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: /La Forma Inteligente de Alquilar/i })).toBeVisible();
});
