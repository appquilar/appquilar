import { Rental, RentStatus } from '@/domain/models/Rental';

export type RentActorRole = 'owner' | 'renter' | 'admin' | 'viewer';

export interface RentTransitionOption {
  to: RentStatus;
  label: string;
  requiresProposalValidUntil?: boolean;
}

const LEAD_WORKFLOW: RentStatus[] = ['lead_pending', 'rental_confirmed', 'rental_active', 'rental_completed'];

const RENTAL_WORKFLOW: RentStatus[] = [
  'rental_confirmed',
  'rental_active',
  'rental_completed',
];

export class RentalStateMachineService {
  static getWorkflowSteps(rental: Rental): RentStatus[] {
    const current = rental.status;
    const isLeadFlowState = ['lead_pending', 'proposal_pending_renter', 'rejected', 'expired'].includes(current);
    const base = isLeadFlowState || rental.isLead ? LEAD_WORKFLOW : RENTAL_WORKFLOW;

    if (!base.includes(current)) {
      if (current === 'proposal_pending_renter') {
        return base;
      }

      return [...base, current];
    }

    return base;
  }

  private static hasActorAcceptedProposal(rental: Rental, actor: RentActorRole): boolean {
    if (actor === 'owner') {
      return Boolean(rental.ownerProposalAccepted);
    }

    if (actor === 'renter') {
      return Boolean(rental.renterProposalAccepted);
    }

    return false;
  }

  static getNextTransitions(
    rental: Rental,
    actor: RentActorRole,
    now: Date = new Date()
  ): RentTransitionOption[] {
    const current = rental.status;
    const options: RentTransitionOption[] = [];
    const ownerCanActivate = now >= rental.startDate;
    const ownerCanComplete = true;
    const proposalIsValid = !rental.proposalValidUntil || now <= rental.proposalValidUntil;

    if (actor === 'viewer') {
      return options;
    }

    if (current === 'lead_pending') {
      if (actor === 'owner' || actor === 'admin') {
        options.push({
          to: 'proposal_pending_renter',
          label: 'Siguiente: Enviar para aceptacion',
          requiresProposalValidUntil: true,
        });
      }

      if (actor === 'owner' || actor === 'admin' || actor === 'renter') {
        options.push({ to: 'cancelled', label: 'Cancelar' });
      }

      return options;
    }

    if (current === 'proposal_pending_renter') {
      if ((actor === 'owner' || actor === 'renter') && proposalIsValid && !this.hasActorAcceptedProposal(rental, actor)) {
        options.push({ to: 'rental_confirmed', label: 'Aceptar propuesta' });
      }

      if (actor === 'admin' && proposalIsValid) {
        options.push({ to: 'rental_confirmed', label: 'Siguiente: Confirmar alquiler' });
      }

      if (actor === 'owner' || actor === 'admin' || actor === 'renter') {
        options.push({ to: 'cancelled', label: 'Cancelar' });
      }

      return options;
    }

    if (current === 'rental_confirmed') {
      if ((actor === 'owner' && ownerCanActivate) || actor === 'admin') {
        options.push({ to: 'rental_active', label: 'Siguiente: Marcar recogida' });
      }

      if (actor === 'owner' || actor === 'admin' || actor === 'renter') {
        options.push({ to: 'cancelled', label: 'Cancelar' });
      }

      return options;
    }

    if (current === 'rental_active') {
      if ((actor === 'owner' && ownerCanComplete) || actor === 'admin') {
        options.push({ to: 'rental_completed', label: 'Siguiente: Marcar devolucion' });
      }
    }

    return options;
  }
}
