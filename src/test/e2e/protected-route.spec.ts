import { expect, test } from "./fixtures";
import { registerNetworkMocks } from "./networkMocks";
import { PUBLIC_PATHS } from "@/domain/config/publicRoutes";

test.beforeEach(async ({ page }) => {
  await registerNetworkMocks(page);
});

test("unauthenticated user is redirected from dashboard to home", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page.getByRole("heading", { name: /La Forma Inteligente de Alquilar/i })).toBeVisible({
    timeout: 10000,
  });
  await expect
    .poll(() => new URL(page.url()).pathname)
    .toBe(PUBLIC_PATHS.home);
});
