import { expect, test } from "./fixtures";
import { registerNetworkMocks } from "./networkMocks";

test.beforeEach(async ({ page }) => {
  await registerNetworkMocks(page);
});

test("search page applies radius filter when geolocation succeeds", async ({ page }) => {
  await page.addInitScript(() => {
    const mockGeolocation: Geolocation = {
      getCurrentPosition: (success) => {
        success({
          coords: {
            latitude: 40.4168,
            longitude: -3.7038,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
            toJSON: () => ({}),
          },
          timestamp: Date.now(),
          toJSON: () => ({}),
        } as GeolocationPosition);
      },
      watchPosition: () => 1,
      clearWatch: () => undefined,
    };

    Object.defineProperty(window.navigator, "geolocation", {
      configurable: true,
      value: mockGeolocation,
    });
  });

  await page.goto("/buscar");

  await page.locator("aside select").selectOption("10");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();

  await expect(page).toHaveURL(/radius=10/);
  await expect(page).toHaveURL(/latitude=/);
  await expect(page).toHaveURL(/longitude=/);
});

test("search page shows a location error when geolocation is rejected", async ({ page }) => {
  await page.addInitScript(() => {
    const mockGeolocation: Geolocation = {
      getCurrentPosition: (_success, error) => {
        error?.({
          code: 1,
          message: "blocked",
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError);
      },
      watchPosition: () => 1,
      clearWatch: () => undefined,
    };

    Object.defineProperty(window.navigator, "geolocation", {
      configurable: true,
      value: mockGeolocation,
    });
  });

  await page.goto("/buscar");

  await page.locator("aside select").selectOption("10");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();

  await expect(page.getByText("No se pudo obtener tu ubicación.")).toBeVisible();
});
