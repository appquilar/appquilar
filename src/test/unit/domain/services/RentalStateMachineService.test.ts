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
  requestedQuantity: partial.requestedQuantity ?? 1,
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

  it("returns the rental workflow for confirmed non-lead rentals", () => {
    const rental = createRental({ status: "rental_confirmed", isLead: false });

    expect(RentalStateMachineService.getWorkflowSteps(rental)).toEqual([
      "rental_confirmed",
      "rental_active",
      "rental_completed",
    ]);
  });

  it("returns no transitions for viewer", () => {
    const rental = createRental({ status: "lead_pending" });

    const transitions = RentalStateMachineService.getNextTransitions(rental, "viewer");

    expect(transitions).toEqual([]);
  });

  it("keeps the lead workflow intact when proposal_pending_renter is already part of it", () => {
    const rental = createRental({
      status: "proposal_pending_renter",
      isLead: false,
    });

    expect(RentalStateMachineService.getWorkflowSteps(rental)).toEqual([
      "lead_pending",
      "proposal_pending_renter",
      "rental_confirmed",
      "rental_active",
      "rental_completed",
    ]);
  });

  it("allows owner to send proposal and cancel from lead_pending", () => {
    const rental = createRental({ status: "lead_pending" });

    const transitions = RentalStateMachineService.getNextTransitions(rental, "owner");

    expect(transitions).toEqual([
      {
        to: "proposal_pending_renter",
        label: "Enviar propuesta",
        requiresProposalValidUntil: true,
        variant: "default",
      },
      {
        to: "rejected",
        label: "Rechazar consulta",
        variant: "destructive",
      },
      { to: "cancelled", label: "Cancelar", variant: "outline" },
    ]);
  });

  it("allows renter to accept proposal only when still valid", () => {
    const validRental = createRental({
      status: "proposal_pending_renter",
      proposalValidUntil: new Date("2026-02-25T10:00:00.000Z"),
      ownerProposalAccepted: true,
      renterProposalAccepted: false,
    });

    const expiredRental = createRental({
      status: "proposal_pending_renter",
      proposalValidUntil: new Date("2026-02-10T10:00:00.000Z"),
      ownerProposalAccepted: true,
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
      variant: "default",
    });
    expect(expiredTransitions).not.toContainEqual({
      to: "rental_confirmed",
      label: "Aceptar propuesta",
    });
  });

  it("allows renter to request changes from a pending proposal", () => {
    const rental = createRental({
      status: "proposal_pending_renter",
      proposalValidUntil: new Date("2026-02-25T10:00:00.000Z"),
      ownerProposalAccepted: true,
      renterProposalAccepted: false,
    });

    const transitions = RentalStateMachineService.getNextTransitions(
      rental,
      "renter",
      new Date("2026-02-20T10:00:00.000Z")
    );

    expect(transitions).toContainEqual({
      to: "lead_pending",
      label: "Solicitar cambios",
      variant: "outline",
    });
  });

  it("lets admins confirm pending proposals and blocks already accepted owners", () => {
    const pendingRental = createRental({
      status: "proposal_pending_renter",
      proposalValidUntil: new Date("2026-02-25T10:00:00.000Z"),
      ownerProposalAccepted: false,
      renterProposalAccepted: true,
    });
    const acceptedByOwnerRental = createRental({
      status: "proposal_pending_renter",
      proposalValidUntil: new Date("2026-02-25T10:00:00.000Z"),
      ownerProposalAccepted: true,
      renterProposalAccepted: true,
    });

    expect(
      RentalStateMachineService.getNextTransitions(
        pendingRental,
        "admin",
        new Date("2026-02-20T10:00:00.000Z")
      )
    ).toContainEqual({
      to: "rental_confirmed",
      label: "Confirmar propuesta",
      variant: "default",
    });

    expect(
      RentalStateMachineService.getNextTransitions(
        acceptedByOwnerRental,
        "owner",
        new Date("2026-02-20T10:00:00.000Z")
      )
    ).not.toContainEqual({
      to: "rental_confirmed",
      label: "Confirmar propuesta",
      variant: "default",
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

    expect(transitions).toEqual([{ to: "cancelled", label: "Cancelar", variant: "outline" }]);
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

    expect(transitions).toContainEqual({
      to: "rental_active",
      label: "Marcar recogida",
      variant: "default",
    });
  });

  it("allows owner to complete active rental", () => {
    const rental = createRental({ status: "rental_active", isLead: false });

    const transitions = RentalStateMachineService.getNextTransitions(rental, "owner");

    expect(transitions).toEqual([
      {
        to: "rental_completed",
        label: "Marcar devolucion",
        variant: "default",
      },
    ]);
  });

  it("reports the actor required for expired, confirmed and active states", () => {
    const expiredProposal = createRental({
      status: "proposal_pending_renter",
      proposalValidUntil: new Date("2026-02-10T10:00:00.000Z"),
      renterProposalAccepted: false,
    });
    const ownerPendingProposal = createRental({
      status: "proposal_pending_renter",
      proposalValidUntil: new Date("2026-02-25T10:00:00.000Z"),
      renterProposalAccepted: true,
      ownerProposalAccepted: false,
    });
    const confirmedRental = createRental({
      status: "rental_confirmed",
      isLead: false,
      startDate: new Date("2026-02-18T10:00:00.000Z"),
    });

    expect(
      RentalStateMachineService.getActionRequiredBy(
        expiredProposal,
        new Date("2026-02-20T10:00:00.000Z")
      )
    ).toBeNull();
    expect(
      RentalStateMachineService.getActionRequiredBy(
        ownerPendingProposal,
        new Date("2026-02-20T10:00:00.000Z")
      )
    ).toBe("owner");
    expect(
      RentalStateMachineService.getActionRequiredBy(
        confirmedRental,
        new Date("2026-02-20T10:00:00.000Z")
      )
    ).toBe("owner");
  });

  it("returns the expected action owner for lead, renter-pending, future-confirmed and terminal states", () => {
    expect(RentalStateMachineService.getActionRequiredBy(createRental({ status: "lead_pending" }))).toBe(
      "owner"
    );

    expect(
      RentalStateMachineService.getActionRequiredBy(
        createRental({
          status: "proposal_pending_renter",
          proposalValidUntil: new Date("2026-02-25T10:00:00.000Z"),
          renterProposalAccepted: false,
          ownerProposalAccepted: false,
        }),
        new Date("2026-02-20T10:00:00.000Z")
      )
    ).toBe("renter");

    expect(
      RentalStateMachineService.getActionRequiredBy(
        createRental({
          status: "rental_confirmed",
          isLead: false,
          startDate: new Date("2026-02-25T10:00:00.000Z"),
        }),
        new Date("2026-02-20T10:00:00.000Z")
      )
    ).toBeNull();

    expect(
      RentalStateMachineService.getActionRequiredBy(
        createRental({
          status: "rental_active",
          isLead: false,
        })
      )
    ).toBe("owner");

    expect(
      RentalStateMachineService.getActionRequiredBy(
        createRental({
          status: "cancelled",
          isLead: false,
        })
      )
    ).toBeNull();
  });

  it("describes the next step and the responsible actor", () => {
    const leadRental = createRental({ status: "lead_pending" });
    const proposalRental = createRental({
      status: "proposal_pending_renter",
      proposalValidUntil: new Date("2026-02-25T10:00:00.000Z"),
      ownerProposalAccepted: true,
    });
    const activeRental = createRental({
      status: "rental_active",
      isLead: false,
    });

    expect(RentalStateMachineService.getNextStepInfo(leadRental)).toMatchObject({
      title: "Responder a la consulta",
      actionRequiredBy: "owner",
    });
    expect(
      RentalStateMachineService.getNextStepInfo(
        proposalRental,
        new Date("2026-02-20T10:00:00.000Z")
      )
    ).toMatchObject({
      title: "Esperando respuesta del cliente",
      actionRequiredBy: "renter",
    });
    expect(RentalStateMachineService.getNextStepInfo(activeRental)).toMatchObject({
      title: "Pendiente de devolucion",
      actionRequiredBy: "owner",
    });
  });

  it("describes expired, completed and cancelled rentals", () => {
    const expiredProposal = createRental({
      status: "proposal_pending_renter",
      proposalValidUntil: new Date("2026-02-10T10:00:00.000Z"),
    });
    const completedRental = createRental({
      status: "rental_completed",
      isLead: false,
    });
    const cancelledRental = createRental({
      status: "cancelled",
      isLead: false,
    });
    const rejectedRental = createRental({
      status: "rejected",
      isLead: true,
    });

    expect(
      RentalStateMachineService.getNextStepInfo(
        expiredProposal,
        new Date("2026-02-20T10:00:00.000Z")
      )
    ).toMatchObject({
      title: "La propuesta ha expirado",
      actionRequiredBy: null,
      tone: "warning",
    });
    expect(RentalStateMachineService.getNextStepInfo(completedRental)).toMatchObject({
      title: "Alquiler cerrado",
      tone: "success",
    });
    expect(RentalStateMachineService.getNextStepInfo(cancelledRental)).toMatchObject({
      title: "Operacion cancelada",
      tone: "neutral",
    });
    expect(RentalStateMachineService.getNextStepInfo(rejectedRental)).toMatchObject({
      title: "Consulta rechazada",
      tone: "warning",
    });
  });

  it("describes confirmed rentals before pickup, owner-pending proposals and unknown terminal states", () => {
    expect(
      RentalStateMachineService.getNextStepInfo(
        createRental({
          status: "proposal_pending_renter",
          proposalValidUntil: new Date("2026-02-25T10:00:00.000Z"),
          renterProposalAccepted: true,
          ownerProposalAccepted: false,
        }),
        new Date("2026-02-20T10:00:00.000Z")
      )
    ).toMatchObject({
      title: "Falta confirmar la propuesta",
      actionRequiredBy: "owner",
      tone: "default",
    });

    expect(
      RentalStateMachineService.getNextStepInfo(
        createRental({
          status: "rental_confirmed",
          isLead: false,
          startDate: new Date("2026-02-25T10:00:00.000Z"),
        }),
        new Date("2026-02-20T10:00:00.000Z")
      )
    ).toMatchObject({
      title: "Reserva confirmada",
      actionRequiredBy: null,
      tone: "success",
    });

    expect(
      RentalStateMachineService.getNextStepInfo(
        createRental({
          status: "expired",
          isLead: true,
        })
      )
    ).toMatchObject({
      title: "Sin acciones pendientes",
      tone: "neutral",
    });
  });
});
