import { describe, expect, it } from "vitest";
import { RentalFilterService } from "@/domain/services/RentalFilterService";
import type { Rental } from "@/domain/models/Rental";

const createRental = (partial: Partial<Rental>): Rental => ({
  id: partial.id ?? "rent-1",
  productId: partial.productId ?? "product-1",
  ownerId: partial.ownerId ?? "owner-1",
  ownerType: partial.ownerType ?? "user",
  renterId: partial.renterId ?? "renter-1",
  startDate: partial.startDate ?? new Date("2026-02-10T10:00:00.000Z"),
  endDate: partial.endDate ?? new Date("2026-02-15T10:00:00.000Z"),
  deposit: partial.deposit ?? { amount: 10000, currency: "EUR" },
  price: partial.price ?? { amount: 5000, currency: "EUR" },
  status: partial.status ?? "rental_confirmed",
  isLead: partial.isLead ?? false,
  productName: partial.productName ?? "Taladro",
  ownerName: partial.ownerName ?? "Empresa Demo",
  renterName: partial.renterName ?? "Victor",
  ownerLocation: partial.ownerLocation ?? { label: "Madrid" },
});

const defaultFilters = {
  searchQuery: "",
  startDate: undefined,
  endDate: undefined,
  rentalId: "",
  statusFilter: "pending" as const,
  roleTab: "owner" as const,
};

describe("RentalFilterService", () => {
  it("filters pending rentals excluding cancelled/completed", () => {
    const rentals = [
      createRental({ id: "pending", status: "rental_confirmed" }),
      createRental({ id: "completed", status: "rental_completed" }),
      createRental({ id: "cancelled", status: "cancelled" }),
    ];

    const filtered = RentalFilterService.filterRentals(rentals, {
      ...defaultFilters,
      statusFilter: "pending",
    });

    expect(filtered.map((r) => r.id)).toEqual(["pending"]);
  });

  it("filters cancelled and completed states explicitly", () => {
    const rentals = [
      createRental({ id: "completed", status: "rental_completed" }),
      createRental({ id: "rejected", status: "rejected" }),
      createRental({ id: "expired", status: "expired" }),
      createRental({ id: "active", status: "rental_active" }),
    ];

    const cancelled = RentalFilterService.filterRentals(rentals, {
      ...defaultFilters,
      statusFilter: "cancelled",
    });
    const completed = RentalFilterService.filterRentals(rentals, {
      ...defaultFilters,
      statusFilter: "completed",
    });

    expect(cancelled.map((r) => r.id).sort()).toEqual(["expired", "rejected"]);
    expect(completed.map((r) => r.id)).toEqual(["completed"]);
  });

  it("matches search query across product, users and location", () => {
    const rentals = [
      createRental({ id: "a", productName: "Generador", ownerLocation: { label: "Valencia" } }),
      createRental({ id: "b", renterName: "Laura" }),
      createRental({ id: "c", ownerName: "Tienda Norte" }),
    ];

    const byProduct = RentalFilterService.filterRentals(rentals, {
      ...defaultFilters,
      searchQuery: "gene",
    });
    const byRenter = RentalFilterService.filterRentals(rentals, {
      ...defaultFilters,
      searchQuery: "laura",
    });
    const byLocation = RentalFilterService.filterRentals(rentals, {
      ...defaultFilters,
      searchQuery: "valencia",
    });

    expect(byProduct.map((r) => r.id)).toEqual(["a"]);
    expect(byRenter.map((r) => r.id)).toEqual(["b"]);
    expect(byLocation.map((r) => r.id)).toEqual(["a"]);
  });

  it("matches date ranges by overlap", () => {
    const rentals = [
      createRental({ id: "inside", startDate: new Date("2026-02-10"), endDate: new Date("2026-02-12") }),
      createRental({ id: "overlap", startDate: new Date("2026-02-08"), endDate: new Date("2026-02-11") }),
      createRental({ id: "outside", startDate: new Date("2026-03-01"), endDate: new Date("2026-03-03") }),
    ];

    const filtered = RentalFilterService.filterRentals(rentals, {
      ...defaultFilters,
      startDate: new Date("2026-02-09"),
      endDate: new Date("2026-02-15"),
    });

    expect(filtered.map((r) => r.id)).toEqual(["overlap", "inside"]);
  });

  it("sorts filtered rentals by startDate ascending", () => {
    const rentals = [
      createRental({ id: "later", startDate: new Date("2026-02-20") }),
      createRental({ id: "first", startDate: new Date("2026-02-01") }),
      createRental({ id: "middle", startDate: new Date("2026-02-10") }),
    ];

    const filtered = RentalFilterService.filterRentals(rentals, defaultFilters);

    expect(filtered.map((r) => r.id)).toEqual(["first", "middle", "later"]);
  });

  it("calculates rental counts by lead/upcoming/past", () => {
    const now = Date.now();
    const rentals = [
      createRental({ id: "lead", isLead: true }),
      createRental({ id: "upcoming", isLead: false, endDate: new Date(now + 10_000) }),
      createRental({ id: "past", isLead: false, endDate: new Date(now - 10_000) }),
    ];

    const counts = RentalFilterService.calculateRentalCounts(rentals);

    expect(counts).toEqual({ leads: 1, upcoming: 1, past: 1 });
  });

  it("checks whether rentals exist on a specific date", () => {
    const rentals = [
      createRental({
        startDate: new Date("2026-02-10T12:00:00.000Z"),
        endDate: new Date("2026-02-12T12:00:00.000Z"),
      }),
    ];

    expect(RentalFilterService.hasRentalsOnDate(rentals, new Date("2026-02-11"))).toBe(true);
    expect(RentalFilterService.hasRentalsOnDate(rentals, new Date("2026-02-15"))).toBe(false);
  });
});
