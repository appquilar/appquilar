import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Rental, RentStatus } from '@/domain/models/Rental';
import {
  RentActorRole,
  RentTransitionOption,
  RentalStateMachineService,
} from '@/domain/services/RentalStateMachineService';
import { RentalStatusService } from '@/domain/services/RentalStatusService';

interface RentalStateWizardProps {
  rental: Rental;
  viewerRole: RentActorRole;
  transitions: RentTransitionOption[];
  isUpdatingStatus: boolean;
  onTransition: (input: { status: RentStatus; proposalValidUntil?: Date | null }) => Promise<void>;
}

const toDateInput = (date: Date): string => {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const parseDateInput = (value: string): Date => {
  const [year, month, day] = value.split('-').map((part) => Number(part));
  return new Date(year, month - 1, day, 0, 0, 0);
};

const formatDisplayDate = (date: Date): string =>
  date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

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

  const workflowSteps = RentalStateMachineService.getWorkflowSteps(rental);
  const currentIndex = workflowSteps.findIndex((step) => step === rental.status);
  const cancelTransition = transitions.find((transition) => transition.to === 'cancelled');
  const nonCancelTransitions = transitions.filter((transition) => transition.to !== 'cancelled');
  const nextStepInfo = RentalStateMachineService.getNextStepInfo(rental);
  const actionRequiredLabel =
    nextStepInfo.actionRequiredBy === 'owner'
      ? 'Tienda'
      : nextStepInfo.actionRequiredBy === 'renter'
      ? 'Cliente'
      : 'Sin accion pendiente';
  const infoBoxClassName =
    nextStepInfo.tone === 'success'
      ? 'border-emerald-200 bg-emerald-50'
      : nextStepInfo.tone === 'warning'
      ? 'border-amber-200 bg-amber-50'
      : nextStepInfo.tone === 'neutral'
      ? 'border-slate-200 bg-slate-50'
      : 'border-primary/20 bg-primary/5';
  const proposalValidityValue = rental.proposalValidUntil
    ? formatDisplayDate(rental.proposalValidUntil)
    : rental.status === 'proposal_pending_renter'
    ? 'Sin fecha limite'
    : 'Sin propuesta activa';
  const proposalValidityDescription = rental.proposalValidUntil
    ? 'La fecha puede ajustarse si cambian los terminos.'
    : rental.status === 'proposal_pending_renter'
    ? 'La propuesta sigue abierta hasta que se acepte, cambie o caduque.'
    : 'Todavia no hay una propuesta enviada al cliente.';
  const viewerRoleLabel =
    viewerRole === 'owner'
      ? 'Tienda'
      : viewerRole === 'renter'
      ? 'Cliente'
      : viewerRole === 'admin'
      ? 'Admin'
      : 'Solo lectura';

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
    <Card className="border-primary/10 shadow-sm">
      <CardHeader className="space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <Badge className={RentalStatusService.getStatusBadgeClasses(rental.status)}>
            {RentalStatusService.getStatusLabel(rental.status)}
          </Badge>
          <p className="text-sm font-medium text-muted-foreground">Rol actual: {viewerRoleLabel}</p>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-xl font-semibold tracking-tight">Estado y acciones</CardTitle>
          <CardDescription>
            Resumen operativo del estado actual y de las acciones que puedes hacer ahora.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-5 pb-5 pt-0 sm:px-6 sm:pb-6">

        <div className={cn('rounded-2xl border px-4 py-4 sm:px-5', infoBoxClassName)}>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Siguiente paso</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
              <p className="text-lg font-semibold text-foreground">{nextStepInfo.title}</p>
              <p className="max-w-2xl text-sm text-muted-foreground">{nextStepInfo.description}</p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[330px]">
              <div className="rounded-xl border border-background/60 bg-background/80 px-3 py-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Pendiente de</p>
                <p className="mt-1 text-sm font-semibold">{actionRequiredLabel}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {nextStepInfo.actionRequiredBy
                    ? `La siguiente accion corresponde a ${actionRequiredLabel.toLowerCase()}.`
                    : 'No hay ninguna accion pendiente ahora mismo.'}
                </p>
              </div>

              <div className="rounded-xl border border-background/60 bg-background/80 px-3 py-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Validez propuesta</p>
                <p className="mt-1 text-sm font-semibold">{proposalValidityValue}</p>
                <p className="mt-1 text-xs text-muted-foreground">{proposalValidityDescription}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Timeline del estado</h3>

          <div className="-mx-1 overflow-x-auto pb-1 md:mx-0 md:overflow-visible md:pb-0">
            <div className="flex min-w-max gap-2 px-1 md:grid md:min-w-0 md:grid-cols-[repeat(auto-fit,minmax(140px,1fr))] md:px-0">
              {workflowSteps.map((step, index) => {
                const isCurrent = step === rental.status;
                const isCompleted = currentIndex > -1 && index < currentIndex;

                return (
                  <div
                    key={step}
                    className={cn(
                      'min-w-[148px] rounded-xl border px-3 py-3 text-xs sm:min-w-[164px]',
                      isCurrent
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : isCompleted
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-border bg-background'
                    )}
                  >
                    <p className="font-medium">{RentalStatusService.getStatusLabel(step)}</p>
                    {isCurrent && <p className="mt-1 text-muted-foreground">Estado actual</p>}
                    {isCompleted && <p className="mt-1 text-emerald-700">Completado</p>}
                    {!isCurrent && !isCompleted && <p className="mt-1 text-muted-foreground">Pendiente</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {(rental.status === 'proposal_pending_renter' || rental.status === 'rental_confirmed') && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold">Aceptacion de la version actual</h3>
                <p className="text-sm text-muted-foreground">
                  Muestra si tienda y cliente estan alineados sobre la propuesta actual.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg border bg-background px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Tienda</p>
                  <p className="mt-1 text-sm font-semibold">
                    {rental.ownerProposalAccepted ? 'Version actual aceptada' : 'Pendiente de confirmar'}
                  </p>
                </div>
                <div className="rounded-lg border bg-background px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Cliente</p>
                  <p className="mt-1 text-sm font-semibold">
                    {rental.renterProposalAccepted ? 'Version actual aceptada' : 'Pendiente de revisar'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold">Acciones disponibles</h3>
            <p className="text-sm text-muted-foreground">
              Solo se muestran acciones validas para tu rol y el estado actual.
            </p>
          </div>

          {transitions.some((item) => item.requiresProposalValidUntil) && (
            <div className="grid gap-2 sm:max-w-sm">
              <label className="text-sm font-medium" htmlFor="proposal-valid-until">
                Propuesta valida hasta (opcional)
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

          {transitions.length === 0 ? (
            <p className="rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">
              No hay acciones operativas disponibles para tu rol en este estado.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {nonCancelTransitions.map((transition) => (
                <Button
                  key={transition.to}
                  variant={transition.variant ?? 'default'}
                  className="w-full"
                  onClick={() => handleTransition(transition)}
                  disabled={isUpdatingStatus}
                >
                  {transition.label}
                </Button>
              ))}

              {cancelTransition && (
                <Button
                  variant={cancelTransition.variant ?? 'outline'}
                  className="w-full sm:col-span-2"
                  onClick={() => handleTransition(cancelTransition)}
                  disabled={isUpdatingStatus}
                >
                  {cancelTransition.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RentalStateWizard;
