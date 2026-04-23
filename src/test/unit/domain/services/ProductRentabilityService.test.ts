import { describe, expect, it } from "vitest";
import {
  formatProductAvailabilityLabel,
  resolveProductRentability,
} from "@/domain/services/ProductRentabilityService";

describe("ProductRentabilityService", () => {
  it("marks published unmanaged products as rentable with the standard message", () => {
    const result = resolveProductRentability({
      publicationStatus: "published",
      quantity: 3,
      isInventoryEnabled: false,
    } as never);

    expect(result).toEqual({
      inventoryManaged: false,
      isRentableNow: true,
      availableQuantity: 3,
      unavailabilityReason: null,
      availabilityLabel: "Disponible",
      availabilityMessage:
        "El producto está visible y se alquila en modo estándar, sin cupos de inventario.",
      availabilityTone: "success",
    });
  });

  it("derives unpublished and out-of-stock states when the summary is absent or limiting", () => {
    const unpublished = resolveProductRentability({
      publicationStatus: "draft",
      quantity: 1,
      inventorySummary: null,
    } as never);

    expect(unpublished).toEqual(
      expect.objectContaining({
        inventoryManaged: false,
        isRentableNow: false,
        unavailabilityReason: "unpublished",
        availabilityLabel: "No publicado",
        availabilityTone: "muted",
      })
    );

    const outOfStock = resolveProductRentability({
      publicationStatus: "published",
      quantity: 2,
      inventorySummary: {
        availableQuantity: 0,
        isInventoryEnabled: true,
        capabilityState: "read_only",
        isRentableNow: false,
        unavailabilityReason: null,
      },
    } as never);

    expect(outOfStock).toEqual(
      expect.objectContaining({
        inventoryManaged: true,
        isRentableNow: false,
        availableQuantity: 0,
        unavailabilityReason: "out_of_stock",
        availabilityLabel: "Sin stock",
        availabilityMessage: "Ahora mismo no quedan huecos libres para nuevas reservas.",
        availabilityTone: "warning",
      })
    );
  });

  it("formats labels including quantity only for managed rentable inventory", () => {
    expect(
      formatProductAvailabilityLabel(
        {
          publicationStatus: "published",
          quantity: 2,
          inventorySummary: {
            availableQuantity: 4,
            isInventoryEnabled: true,
            capabilityState: "enabled",
            isRentableNow: true,
            unavailabilityReason: null,
          },
        } as never,
        { includeQuantity: true }
      )
    ).toBe("Disponible (4)");

    expect(
      formatProductAvailabilityLabel(
        {
          publicationStatus: "draft",
          quantity: 2,
        } as never,
        { includeQuantity: true }
      )
    ).toBe("No publicado");
  });

  it("uses explicit summary flags and default fallbacks for edge availability states", () => {
    const summaryDisabled = resolveProductRentability({
      publicationStatus: "published",
      quantity: 0,
      inventorySummary: {
        availableQuantity: 0,
        isInventoryEnabled: true,
        capabilityState: "disabled",
        isRentableNow: true,
        unavailabilityReason: null,
      },
    } as never);

    expect(summaryDisabled).toEqual(
      expect.objectContaining({
        inventoryManaged: false,
        isRentableNow: true,
        availableQuantity: 1,
        unavailabilityReason: null,
        availabilityMessage:
          "El producto está visible y se alquila en modo estándar, sin cupos de inventario.",
      })
    );

    const explicitUnknownReason = resolveProductRentability({
      publicationStatus: "published",
      inventorySummary: {
        availableQuantity: 0,
        isInventoryEnabled: true,
        capabilityState: "enabled",
        isRentableNow: false,
        unavailabilityReason: "maintenance",
      },
    } as never);

    expect(explicitUnknownReason).toEqual(
      expect.objectContaining({
        inventoryManaged: true,
        isRentableNow: false,
        unavailabilityReason: "maintenance",
        availabilityLabel: "No disponible",
        availabilityMessage:
          "El producto no está disponible para nuevas reservas en este momento.",
        availabilityTone: "muted",
      })
    );
  });
});
