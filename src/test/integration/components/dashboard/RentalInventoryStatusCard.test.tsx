import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import RentalInventoryStatusCard from "@/components/dashboard/rentals/details/RentalInventoryStatusCard";
import type { ProductInventorySummary } from "@/domain/models/Product";
import type { Rental } from "@/domain/models/Rental";

const {
  useProductInventoryMock,
  useProductInventoryAllocationsMock,
  useProductInventoryUnitsMock,
} = vi.hoisted(() => ({
  useProductInventoryMock: vi.fn(),
  useProductInventoryAllocationsMock: vi.fn(),
  useProductInventoryUnitsMock: vi.fn(),
}));

vi.mock("@/application/hooks/useProductInventory", () => ({
  useProductInventory: useProductInventoryMock,
  useProductInventoryAllocations: useProductInventoryAllocationsMock,
  useProductInventoryUnits: useProductInventoryUnitsMock,
}));

const buildRental = (): Rental => ({
  id: "rent-1",
  productId: "product-1",
  productName: "Generador",
  productSlug: "generador",
  productPublicationStatus: "published",
  productInternalId: "GEN-001",
  ownerId: "company-1",
  ownerType: "company",
  ownerName: "Staging Rentals",
  renterId: "renter-1",
  renterName: "Cliente",
  renterEmail: "cliente@appquilar.test",
  ownerLocation: null,
  startDate: new Date(2026, 7, 1, 0, 0, 0),
  endDate: new Date(2026, 7, 3, 23, 59, 59),
  requestedQuantity: 1,
  deposit: { amount: 1000, currency: "EUR" },
  price: { amount: 500, currency: "EUR" },
  status: "rental_confirmed",
  isLead: false,
  ownerProposalAccepted: false,
  renterProposalAccepted: false,
});

const unmanagedInventory: ProductInventorySummary = {
  productId: "product-1",
  productInternalId: "GEN-001",
  totalQuantity: 1,
  reservedQuantity: 0,
  availableQuantity: 1,
  isRentalEnabled: true,
  isInventoryEnabled: false,
  capabilityState: "disabled",
  inventoryMode: "unmanaged",
  isRentableNow: true,
  unavailabilityReason: null,
};

describe("RentalInventoryStatusCard", () => {
  it("states clearly when a confirmed rental has manual inventory without automatic reservation", async () => {
    useProductInventoryMock.mockReturnValue({
      data: unmanagedInventory,
      isLoading: false,
    });
    useProductInventoryAllocationsMock.mockReturnValue({
      data: [],
    });
    useProductInventoryUnitsMock.mockReturnValue({
      data: [],
    });

    render(
      <MemoryRouter>
        <RentalInventoryStatusCard rental={buildRental()} viewerRole="owner" />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Sin reserva automática")).toBeInTheDocument();
    expect(screen.getByText("Sin bloqueo automático")).toBeInTheDocument();
    expect(
      screen.getByText(/Appquilar no bloquea unidades automáticamente para este alquiler/i),
    ).toBeInTheDocument();
  });
});
