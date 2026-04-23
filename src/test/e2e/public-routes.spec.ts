import { expect, test } from "./fixtures";
import { registerNetworkMocks } from "./networkMocks";

test.beforeEach(async ({ page }) => {
  await registerNetworkMocks(page);
});

test("legacy public aliases redirect to the Spanish marketplace routes", async ({ page }) => {
  await page.goto("/categories");

  await expect
    .poll(() => new URL(page.url()).pathname)
    .toBe("/categorias");
  await expect(page.getByRole("heading", { name: "Todas las categorías" })).toBeVisible();
  await expect(page.getByRole("main").getByRole("link", { name: "Accesorios" })).toHaveAttribute(
    "href",
    "/categoria/accesorios"
  );

  await page.goto("/about");

  await expect
    .poll(() => new URL(page.url()).pathname)
    .toBe("/quienes-somos");
  await expect(page.getByRole("heading", { name: "Quiénes somos" })).toBeVisible();

  await page.goto("/partners");

  await expect
    .poll(() => new URL(page.url()).pathname)
    .toBe("/colabora-con-nosotros");
  await expect(page.getByRole("heading", { name: "Colabora con nosotros" })).toBeVisible();
});

test("partners page enables the mailto CTA only after the required fields are completed", async ({
  page,
}) => {
  await page.goto("/colabora-con-nosotros");

  const submitButton = page.getByRole("button", { name: "Enviar solicitud" });
  const mailtoLink = page.locator("a[href^='mailto:']");

  await expect(submitButton).toBeDisabled();

  await page.getByPlaceholder("Nombre de la empresa").fill("Alquileres Norte");
  await page.getByPlaceholder("empresa@email.com").fill("ops@alquileres.test");
  await page
    .getByPlaceholder("Cuéntanos qué necesitas o cómo te gustaría colaborar")
    .fill("Queremos ofrecer herramientas de alquiler en Madrid.");

  await expect(submitButton).toBeEnabled();
  await expect(mailtoLink).toHaveAttribute("href", /Partners/);
  await expect(mailtoLink).toHaveAttribute("href", /Alquileres%20Norte/);
  await expect(mailtoLink).toHaveAttribute("href", /ops%40alquileres\.test/);
});
