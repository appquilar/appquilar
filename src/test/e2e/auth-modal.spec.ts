import { expect, test } from "./fixtures";
import { registerNetworkMocks } from "./networkMocks";

test.beforeEach(async ({ page }) => {
  await registerNetworkMocks(page);
});

test("authentication modal supports login/register and recovery from forgot password", async ({ page }) => {
  await page.goto("/");

  await page.locator("[data-trigger-login]:visible").click();

  const modal = page.getByRole("dialog");

  await expect(modal.getByText("Accede a tu cuenta")).toBeVisible();
  await expect(modal.locator("button[type='submit']").first()).toHaveText("Iniciar sesión");

  await modal.getByRole("button", { name: "Registrarse" }).click();
  await expect(modal.getByRole("button", { name: "Crear cuenta" })).toBeVisible();

  await expect(modal.getByRole("button", { name: "Recuperar" })).toHaveCount(0);

  await modal.getByRole("button", { name: "Iniciar sesión" }).click();
  await modal.getByRole("button", { name: "¿Has olvidado tu contraseña?" }).click();
  await expect(modal.getByRole("button", { name: "Enviar enlace de recuperación" })).toBeVisible();
});
