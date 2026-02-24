import { describe, expect, it } from "vitest";
import { RentalStateMachineService } from "@/domain/services/RentalStateMachineService";
import type { Rental } from "@/domain/models/Rental";

const createRental = (partial: Partial<Rental>): Rental => ({
  id: partial.id ?? "rent-1",
  productId: partial.productId ?? "product-1",
  ownerId: partial.ownerId ?? "owner-1",
  ownerType: partial.ownerType ?? "company",
  renterId: partial.renterId ?? "renter-1",
  startDate: partial.startDate ?? new Date("2026-02-20T10:00:00.000Z"),
  endDate: partial.endDate ?? new Date("2026-02-28T10:00:00.000Z"),
  deposit: partial.deposit ?? { amount: 10000, currency: "EUR" },
  price: partial.price ?? { amount: 5000, currency: "EUR" },
  status: partial.status ?? "lead_pending",
  isLead: partial.isLead ?? true,
  proposalValidUntil: partial.proposalValidUntil,
  ownerProposalAccepted: partial.ownerProposalAccepted,
  renterProposalAccepted: partial.renterProposalAccepted,
});

describe("RentalStateMachineService", () => {
  it("returns lead workflow when rental is lead or in lead states", () => {
    const rental = createRental({ status: "lead_pending", isLead: true });

    const steps = RentalStateMachineService.getWorkflowSteps(rental);

    expect(steps).toEqual([
      "lead_pending",
      "proposal_pending_renter",
      "rental_confirmed",
      "rental_active",
      "rental_completed",
    ]);
  });

  it("appends unknown status to workflow", () => {
    const rental = createRental({ status: "cancelled", isLead: false });

    const steps = RentalStateMachineService.getWorkflowSteps(rental);

    expect(steps).toContain("cancelled");
    expect(steps[steps.length - 1]).toBe("cancelled");
  });

  it("returns no transitions for viewer", () => {
    const rental = createRental({ status: "lead_pending" });

    const transitions = RentalStateMachineService.getNextTransitions(rental, "viewer");

    expect(transitions).toEqual([]);
  });

  it("allows owner to send proposal and cancel from lead_pending", () => {
    const rental = createRental({ status: "lead_pending" });

    const transitions = RentalStateMachineService.getNextTransitions(rental, "owner");

    expect(transitions).toEqual([
      {
        to: "proposal_pending_renter",
        label: "Siguiente: Enviar para aceptacion",
        requiresProposalValidUntil: true,
      },
      { to: "cancelled", label: "Cancelar" },
    ]);
  });

  it("allows renter to accept proposal only when still valid", () => {
    const validRental = createRental({
      status: "proposal_pending_renter",
      proposalValidUntil: new Date("2026-02-25T10:00:00.000Z"),
      renterProposalAccepted: false,
    });

    const expiredRental = createRental({
      status: "proposal_pending_renter",
      proposalValidUntil: new Date("2026-02-10T10:00:00.000Z"),
      renterProposalAccepted: false,
    });

    const validTransitions = RentalStateMachineService.getNextTransitions(
      validRental,
      "renter",
      new Date("2026-02-20T10:00:00.000Z")
    );

    const expiredTransitions = RentalStateMachineService.getNextTransitions(
      expiredRental,
      "renter",
      new Date("2026-02-20T10:00:00.000Z")
    );

    expect(validTransitions).toContainEqual({
      to: "rental_confirmed",
      label: "Aceptar propuesta",
    });
    expect(expiredTransitions).not.toContainEqual({
      to: "rental_confirmed",
      label: "Aceptar propuesta",
    });
  });

  it("does not allow owner to activate rental before start date", () => {
    const rental = createRental({
      status: "rental_confirmed",
      startDate: new Date("2026-03-01T10:00:00.000Z"),
      isLead: false,
    });

    const transitions = RentalStateMachineService.getNextTransitions(
      rental,
      "owner",
      new Date("2026-02-20T10:00:00.000Z")
    );

    expect(transitions).toEqual([{ to: "cancelled", label: "Cancelar" }]);
  });

  it("allows admin to activate rental regardless of start date", () => {
    const rental = createRental({
      status: "rental_confirmed",
      startDate: new Date("2026-03-01T10:00:00.000Z"),
      isLead: false,
    });

    const transitions = RentalStateMachineService.getNextTransitions(
      rental,
      "admin",
      new Date("2026-02-20T10:00:00.000Z")
    );

    expect(transitions).toContainEqual({ to: "rental_active", label: "Siguiente: Marcar recogida" });
  });

  it("allows owner to complete active rental", () => {
    const rental = createRental({ status: "rental_active", isLead: false });

    const transitions = RentalStateMachineService.getNextTransitions(rental, "owner");

    expect(transitions).toEqual([{ to: "rental_completed", label: "Siguiente: Marcar devolucion" }]);
  });
});
