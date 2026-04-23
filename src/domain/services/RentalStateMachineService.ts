import { Rental, RentStatus } from '@/domain/models/Rental';

export type RentActorRole = 'owner' | 'renter' | 'admin' | 'viewer';
export type RentActionRequiredBy = 'owner' | 'renter' | null;

export interface RentTransitionOption {
  to: RentStatus;
  label: string;
  requiresProposalValidUntil?: boolean;
  variant?: 'default' | 'outline' | 'destructive';
}

export interface RentNextStepInfo {
  title: string;
  description: string;
  actionRequiredBy: RentActionRequiredBy;
  tone: 'default' | 'success' | 'warning' | 'neutral';
}

const LEAD_WORKFLOW: RentStatus[] = [
  'lead_pending',
  'proposal_pending_renter',
  'rental_confirmed',
  'rental_active',
  'rental_completed',
];

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
          label: 'Enviar propuesta',
          requiresProposalValidUntil: true,
          variant: 'default',
        });
        options.push({
          to: 'rejected',
          label: 'Rechazar consulta',
          variant: 'destructive',
        });
      }

      if (actor === 'owner' || actor === 'admin' || actor === 'renter') {
        options.push({
          to: 'cancelled',
          label: actor === 'renter' ? 'Cancelar consulta' : 'Cancelar',
          variant: 'outline',
        });
      }

      return options;
    }

    if (current === 'proposal_pending_renter') {
      if ((actor === 'owner' || actor === 'renter') && proposalIsValid && !this.hasActorAcceptedProposal(rental, actor)) {
        options.push({
          to: 'rental_confirmed',
          label: actor === 'owner' ? 'Confirmar propuesta' : 'Aceptar propuesta',
          variant: 'default',
        });
      }

      if (actor === 'admin' && proposalIsValid) {
        options.push({
          to: 'rental_confirmed',
          label: 'Confirmar propuesta',
          variant: 'default',
        });
      }

      if (actor === 'renter') {
        options.push({
          to: 'lead_pending',
          label: 'Solicitar cambios',
          variant: 'outline',
        });
      }

      if (actor === 'owner' || actor === 'admin' || actor === 'renter') {
        options.push({
          to: 'cancelled',
          label: 'Cancelar',
          variant: 'outline',
        });
      }

      return options;
    }

    if (current === 'rental_confirmed') {
      if ((actor === 'owner' && ownerCanActivate) || actor === 'admin') {
        options.push({
          to: 'rental_active',
          label: 'Marcar recogida',
          variant: 'default',
        });
      }

      if (actor === 'owner' || actor === 'admin' || actor === 'renter') {
        options.push({
          to: 'cancelled',
          label: 'Cancelar',
          variant: 'outline',
        });
      }

      return options;
    }

    if (current === 'rental_active') {
      if ((actor === 'owner' && ownerCanComplete) || actor === 'admin') {
        options.push({
          to: 'rental_completed',
          label: 'Marcar devolucion',
          variant: 'default',
        });
      }
    }

    return options;
  }

  static getActionRequiredBy(
    rental: Rental,
    now: Date = new Date()
  ): RentActionRequiredBy {
    if (rental.status === 'lead_pending') {
      return 'owner';
    }

    if (rental.status === 'proposal_pending_renter') {
      if (rental.proposalValidUntil && now > rental.proposalValidUntil) {
        return null;
      }

      if (!rental.renterProposalAccepted) {
        return 'renter';
      }

      if (!rental.ownerProposalAccepted) {
        return 'owner';
      }

      return null;
    }

    if (rental.status === 'rental_confirmed') {
      return now >= rental.startDate ? 'owner' : null;
    }

    if (rental.status === 'rental_active') {
      return 'owner';
    }

    return null;
  }

  static getNextStepInfo(
    rental: Rental,
    now: Date = new Date()
  ): RentNextStepInfo {
    const proposalExpired =
      rental.status === 'proposal_pending_renter'
      && rental.proposalValidUntil !== null
      && now > rental.proposalValidUntil;

    if (rental.status === 'lead_pending') {
      return {
        title: 'Responder a la consulta',
        description: 'La tienda puede revisar los terminos, enviar una propuesta o rechazarla.',
        actionRequiredBy: 'owner',
        tone: 'default',
      };
    }

    if (proposalExpired) {
      return {
        title: 'La propuesta ha expirado',
        description: 'Hace falta volver a revisar los terminos para retomar el alquiler.',
        actionRequiredBy: null,
        tone: 'warning',
      };
    }

    if (rental.status === 'proposal_pending_renter') {
      if (!rental.renterProposalAccepted) {
        return {
          title: 'Esperando respuesta del cliente',
          description: 'El cliente puede aceptar la propuesta, solicitar cambios o cancelar.',
          actionRequiredBy: 'renter',
          tone: 'default',
        };
      }

      if (!rental.ownerProposalAccepted) {
        return {
          title: 'Falta confirmar la propuesta',
          description: 'La tienda debe confirmar esta version para cerrar la reserva.',
          actionRequiredBy: 'owner',
          tone: 'default',
        };
      }
    }

    if (rental.status === 'rental_confirmed') {
      return {
        title: now >= rental.startDate ? 'Pendiente de recogida' : 'Reserva confirmada',
        description:
          now >= rental.startDate
            ? 'La tienda ya puede marcar la recogida cuando entregue el producto.'
            : 'Todo esta listo para la recogida en la fecha acordada.',
        actionRequiredBy: now >= rental.startDate ? 'owner' : null,
        tone: now >= rental.startDate ? 'default' : 'success',
      };
    }

    if (rental.status === 'rental_active') {
      return {
        title: 'Pendiente de devolucion',
        description: 'La tienda puede cerrar el alquiler cuando reciba el producto.',
        actionRequiredBy: 'owner',
        tone: 'default',
      };
    }

    if (rental.status === 'rental_completed') {
      return {
        title: 'Alquiler cerrado',
        description: 'El alquiler ya esta completado. Solo queda revisar la resolucion de la fianza si aplica.',
        actionRequiredBy: null,
        tone: 'success',
      };
    }

    if (rental.status === 'cancelled') {
      return {
        title: 'Operacion cancelada',
        description: 'Este alquiler ya no tiene acciones operativas disponibles.',
        actionRequiredBy: null,
        tone: 'neutral',
      };
    }

    if (rental.status === 'rejected') {
      return {
        title: 'Consulta rechazada',
        description: 'La consulta se ha cerrado sin convertirse en reserva.',
        actionRequiredBy: null,
        tone: 'warning',
      };
    }

    return {
      title: 'Sin acciones pendientes',
      description: 'No hay pasos operativos pendientes para este alquiler.',
      actionRequiredBy: null,
      tone: 'neutral',
    };
  }
}
