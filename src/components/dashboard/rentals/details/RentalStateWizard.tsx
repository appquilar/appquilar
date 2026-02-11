import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Rental } from '@/domain/models/Rental';
import { RentStatus } from '@/domain/models/Rental';
import { RentActorRole, RentTransitionOption } from '@/domain/services/RentalStateMachineService';
import { RentalStatusService } from '@/domain/services/RentalStatusService';

interface RentalStateWizardProps {
  rental: Rental;
  viewerRole: RentActorRole;
  transitions: RentTransitionOption[];
  isUpdatingStatus: boolean;
  onTransition: (input: { status: RentStatus; proposalValidUntil?: Date | null }) => Promise<void>;
}

const WIZARD_STEPS: RentStatus[] = [
  'proposal_pending_renter',
  'rental_confirmed',
  'rental_active',
  'rental_completed',
];

const getWizardStepLabel = (status: RentStatus): string => {
  if (status === 'proposal_pending_renter') {
    return 'Oferta / Propuesta';
  }

  return RentalStatusService.getStatusLabel(status);
};

const toDateInput = (date: Date): string => {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const parseDateInput = (value: string): Date => {
  const [year, month, day] = value.split('-').map((part) => Number(part));
  return new Date(year, month - 1, day, 0, 0, 0);
};

const RentalStateWizard = ({
  rental,
  viewerRole,
  transitions,
  isUpdatingStatus,
  onTransition,
}: RentalStateWizardProps) => {
  const [proposalValidUntil, setProposalValidUntil] = useState<string>(
    rental.proposalValidUntil ? toDateInput(rental.proposalValidUntil) : ''
  );

  const steps = WIZARD_STEPS;
  const effectiveCurrentStatus: RentStatus =
    rental.status === 'lead_pending' ? 'proposal_pending_renter' : rental.status;
  const currentIndex = steps.findIndex((step) => step === effectiveCurrentStatus);
  const cancelTransition = transitions.find((transition) => transition.to === 'cancelled');
  const nonCancelTransitions = transitions.filter((transition) => transition.to !== 'cancelled');

  const handleTransition = async (transition: RentTransitionOption) => {
    let parsedProposalValidUntil: Date | null | undefined;

    if (transition.requiresProposalValidUntil) {
      parsedProposalValidUntil = proposalValidUntil ? parseDateInput(proposalValidUntil) : null;
    }

    await onTransition({
      status: transition.to,
      proposalValidUntil: parsedProposalValidUntil,
    });
  };

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardContent className="p-6 space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Estado del alquiler</h3>
            <p className="text-sm text-muted-foreground">
              Rol actual: {viewerRole === 'owner' ? 'Tienda' : viewerRole === 'renter' ? 'Cliente' : viewerRole === 'admin' ? 'Admin' : 'Solo lectura'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
          {steps.map((step, index) => {
            const isCurrent = step === effectiveCurrentStatus;
            const isCompleted = currentIndex > -1 && index < currentIndex;
            return (
              <div
                key={step}
                className={`rounded-md border px-3 py-2 text-xs ${
                  isCurrent ? 'border-primary bg-primary/5' : isCompleted ? 'border-emerald-200 bg-emerald-50' : 'border-border'
                }`}
              >
                <p className="font-medium">{getWizardStepLabel(step)}</p>
                {isCurrent && <p className="text-muted-foreground mt-1">Estado actual</p>}
                {isCompleted && <p className="text-emerald-700 mt-1">Completado</p>}
              </div>
            );
          })}
        </div>

        {transitions.some((item) => item.requiresProposalValidUntil) && (
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="proposal-valid-until">
              Propuesta válida hasta (opcional)
            </label>
            <Input
              id="proposal-valid-until"
              type="date"
              lang="es-ES"
              value={proposalValidUntil}
              onChange={(event) => setProposalValidUntil(event.target.value)}
              disabled={isUpdatingStatus}
            />
          </div>
        )}

        {(rental.status === 'proposal_pending_renter' || rental.status === 'rental_confirmed') && (
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <p>Tienda: {rental.ownerProposalAccepted ? 'Aceptada' : 'Pendiente de aceptar'}</p>
            <p>Cliente: {rental.renterProposalAccepted ? 'Aceptada' : 'Pendiente de aceptar'}</p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {transitions.length === 0 && (
            <p className="text-sm text-muted-foreground">No hay transiciones disponibles para tu rol en este estado.</p>
          )}
          {nonCancelTransitions.map((transition) => (
            <Button
              key={transition.to}
              variant="default"
              onClick={() => handleTransition(transition)}
              disabled={isUpdatingStatus}
            >
              {transition.label}
            </Button>
          ))}
          {cancelTransition && (
            <Button
              variant="outline"
              className="ml-auto border-slate-300 bg-white text-slate-900 shadow-sm hover:bg-white hover:border-slate-400 hover:shadow-md"
              onClick={() => handleTransition(cancelTransition)}
              disabled={isUpdatingStatus}
            >
              Cancelar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RentalStateWizard;
