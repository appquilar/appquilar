import { afterEach, describe, expect, it, vi } from "vitest";

describe("RentalForm", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("parses valid rental form payloads and normalizes decimal strings", async () => {
    const { rentalFormSchema } = await import("@/domain/models/RentalForm");

    const result = rentalFormSchema.parse({
      rentId: "rent-1",
      productId: "product-1",
      renterEmail: "user@appquilar.test",
      renterName: "  Ada Lovelace  ",
      startDate: new Date("2026-05-01T10:00:00.000Z"),
      endDate: new Date("2026-05-03T10:00:00.000Z"),
      requestedQuantity: "3",
      priceAmount: "1500,50",
      priceCurrency: "EUR",
      depositAmount: 250,
      depositCurrency: "EUR",
    });

    expect(result.requestedQuantity).toBe(3);
    expect(result.priceAmount).toBe(1500.5);
    expect(result.depositAmount).toBe(250);
    expect(result.renterName).toBe("Ada Lovelace");
  });

  it("reports validation errors for missing, negative and inconsistent values", async () => {
    const { rentalFormSchema } = await import("@/domain/models/RentalForm");

    const result = rentalFormSchema.safeParse({
      rentId: "",
      productId: "",
      renterEmail: "invalid-email",
      startDate: new Date("2026-05-03T10:00:00.000Z"),
      endDate: new Date("2026-05-01T10:00:00.000Z"),
      requestedQuantity: 0,
      priceAmount: "",
      priceCurrency: "",
      depositAmount: "-1",
      depositCurrency: "",
    });

    expect(result.success).toBe(false);
    expect(result.error.flatten().fieldErrors.rentId).toContain(
      "El ID del alquiler es requerido"
    );
    expect(result.error.flatten().fieldErrors.productId).toContain(
      "El producto es requerido"
    );
    expect(result.error.flatten().fieldErrors.renterEmail).toContain(
      "Debes introducir un email válido"
    );
    expect(result.error.flatten().fieldErrors.requestedQuantity).toContain(
      "La cantidad debe ser al menos 1"
    );
    expect(result.error.flatten().fieldErrors.priceAmount).toContain(
      "El importe es obligatorio"
    );
    expect(result.error.flatten().fieldErrors.depositAmount).toContain(
      "La fianza debe ser mayor o igual a 0"
    );
    expect(result.error.flatten().fieldErrors.endDate).toContain(
      "La fecha de fin debe ser posterior a la fecha de inicio"
    );
  });

  it("builds default values with a browser uuid when crypto is available", async () => {
    vi.stubGlobal("crypto", {
      randomUUID: vi.fn(() => "550e8400-e29b-41d4-a716-446655440000"),
    });

    const { defaultRentalFormValues } = await import("@/domain/models/RentalForm");

    expect(defaultRentalFormValues.rentId).toBe(
      "550e8400-e29b-41d4-a716-446655440000"
    );
    expect(defaultRentalFormValues.requestedQuantity).toBe(1);
    expect(defaultRentalFormValues.priceCurrency).toBe("EUR");
    expect(defaultRentalFormValues.depositCurrency).toBe("EUR");
    expect(defaultRentalFormValues.priceAmount).toBe("");
    expect(defaultRentalFormValues.depositAmount).toBe("");
    expect(defaultRentalFormValues.startDate).toBeInstanceOf(Date);
    expect(defaultRentalFormValues.endDate).toBeInstanceOf(Date);
  });

  it("falls back to an empty rent id when crypto.randomUUID is not available", async () => {
    vi.stubGlobal("crypto", {});

    const { defaultRentalFormValues } = await import("@/domain/models/RentalForm");

    expect(defaultRentalFormValues.rentId).toBe("");
  });
});
