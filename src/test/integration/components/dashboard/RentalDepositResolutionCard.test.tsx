import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import RentalDepositResolutionCard from "@/components/dashboard/rentals/details/RentalDepositResolutionCard";
import type { Rental } from "@/domain/models/Rental";

const rental = (depositReturnedAmount: number | null): Rental => ({
  id: "rent-1",
  productId: "product-1",
  productName: "Sierra",
  ownerId: "owner-1",
  ownerType: "company",
  ownerName: "Tienda",
  renterId: "renter-1",
  renterName: "Cliente",
  renterEmail: "cliente@appquilar.test",
  startDate: new Date("2026-07-05T00:00:00.000Z"),
  endDate: new Date("2026-07-06T23:59:59.000Z"),
  requestedQuantity: 1,
  deposit: { amount: 8000, currency: "EUR" },
  depositReturned: depositReturnedAmount === null ? null : { amount: depositReturnedAmount, currency: "EUR" },
  price: { amount: 5400, currency: "EUR" },
  status: "rental_completed",
  isLead: false,
});

describe("RentalDepositResolutionCard", () => {
  it("does not resubmit an unchanged deposit resolution", () => {
    render(
      <RentalDepositResolutionCard
        rental={rental(8000)}
        isSaving={false}
        onResolve={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Guardar resolución" })).toBeDisabled();
  });
});
