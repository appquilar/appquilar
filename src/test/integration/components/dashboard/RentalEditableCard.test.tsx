import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import RentalEditableCard from "@/components/dashboard/rentals/details/RentalEditableCard";
import type { Rental } from "@/domain/models/Rental";

vi.mock("@/application/hooks/useProducts", () => ({
  useCalculateRentalCost: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("@/components/ui/use-toast", () => ({
  toast: vi.fn(),
}));

const sampleRental = (): Rental => ({
  id: "rent-1",
  productId: "product-1",
  productName: "Taladro",
  ownerId: "owner-1",
  ownerName: "Victor",
  ownerType: "user",
  renterId: "renter-1",
  renterName: "Cliente",
  renterEmail: "cliente@ejemplo.com",
  startDate: new Date("2026-04-14T00:00:00.000Z"),
  endDate: new Date("2026-04-20T00:00:00.000Z"),
  deposit: { amount: 5500, currency: "EUR" },
  price: { amount: 12500, currency: "EUR" },
  status: "lead_pending",
  isLead: true,
});

describe("RentalEditableCard", () => {
  it("lets price fields be cleared and rewritten naturally", async () => {
    const user = userEvent.setup();

    render(
      <RentalEditableCard
        rental={sampleRental()}
        viewerRole="owner"
        isSaving={false}
        onSave={vi.fn()}
      />
    );

    const priceInput = screen.getByLabelText(/Precio \(EUR\)/i) as HTMLInputElement;
    const depositInput = screen.getByLabelText(/Fianza \(EUR\)/i) as HTMLInputElement;

    expect(priceInput.value).toBe("125");
    expect(depositInput.value).toBe("55");

    await user.clear(priceInput);
    expect(priceInput.value).toBe("");

    await user.type(priceInput, "49.95");
    expect(priceInput.value).toBe("49.95");

    await user.clear(depositInput);
    expect(depositInput.value).toBe("");

    await user.type(depositInput, "12.5");
    expect(depositInput.value).toBe("12.5");
  });
});
