import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Rental } from '@/domain/models/Rental';
import { useCalculateRentalCost } from '@/application/hooks/useProducts';
import { toast } from '@/components/ui/use-toast';
import { Money } from '@/domain/models/Money';
import { RentActorRole } from '@/domain/services/RentalStateMachineService';

const rentalEditSchema = z.object({
  startDate: z.string().min(1, 'Fecha de inicio obligatoria'),
  endDate: z.string().min(1, 'Fecha de fin obligatoria'),
  priceAmount: z.number().min(0, 'El precio no puede ser negativo'),
  depositAmount: z.number().min(0, 'La fianza no puede ser negativa'),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'La fecha de fin debe ser igual o posterior a la de inicio',
  path: ['endDate'],
});

type RentalEditValues = z.infer<typeof rentalEditSchema>;

interface RentalEditableCardProps {
  rental: Rental;
  viewerRole: RentActorRole;
  isSaving: boolean;
  onSave: (data: {
    startDate: Date;
    endDate: Date;
    deposit?: Money;
    price?: Money;
  }) => Promise<void>;
}

const toDateInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fromDateInput = (dateText: string, endOfDay: boolean): Date => {
  const [year, month, day] = dateText.split('-').map((value) => Number(value));
  return endOfDay
    ? new Date(year, month - 1, day, 23, 59, 59)
    : new Date(year, month - 1, day, 0, 0, 0);
};

const toCents = (value: number): number => Math.round((Number.isFinite(value) ? value : 0) * 100);

const RentalEditableCard = ({ rental, viewerRole, isSaving, onSave }: RentalEditableCardProps) => {
  const canEditPrice = viewerRole === 'owner' || viewerRole === 'admin';
  const form = useForm<RentalEditValues>({
    resolver: zodResolver(rentalEditSchema),
    defaultValues: {
      startDate: toDateInput(rental.startDate),
      endDate: toDateInput(rental.endDate),
      priceAmount: rental.price.amount / 100,
      depositAmount: rental.deposit.amount / 100,
    },
  });

  const { mutateAsync: calculateRentalCost, isPending: isCalculating } = useCalculateRentalCost();

  useEffect(() => {
    form.reset({
      startDate: toDateInput(rental.startDate),
      endDate: toDateInput(rental.endDate),
      priceAmount: rental.price.amount / 100,
      depositAmount: rental.deposit.amount / 100,
    });
  }, [rental, form]);

  const handleRecalculate = async () => {
    const values = form.getValues();
    if (!values.startDate || !values.endDate) {
      return;
    }

    try {
      const result = await calculateRentalCost({
        productId: rental.productId,
        startDate: values.startDate,
        endDate: values.endDate,
      });

      form.setValue('priceAmount', result.rentalPrice.amount / 100, { shouldValidate: true });
      form.setValue('depositAmount', result.deposit.amount / 100, { shouldValidate: true });
    } catch (_error) {
      toast({
        title: 'No se pudo recalcular',
        description: 'Revisa las fechas seleccionadas.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (values: RentalEditValues) => {
    const payload: {
      startDate: Date;
      endDate: Date;
      deposit?: Money;
      price?: Money;
    } = {
      startDate: fromDateInput(values.startDate, false),
      endDate: fromDateInput(values.endDate, true),
    };

    if (canEditPrice) {
      payload.deposit = {
        amount: toCents(values.depositAmount),
        currency: rental.deposit.currency,
      };
      payload.price = {
        amount: toCents(values.priceAmount),
        currency: rental.price.currency,
      };
    }

    await onSave({
      ...payload,
    });
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Editar Fechas y Precio</h3>
          <p className="text-sm text-muted-foreground">
            Puedes ajustar este lead o alquiler y guardar cambios.
          </p>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="edit-start-date">Fecha de inicio</Label>
              <Input id="edit-start-date" type="date" lang="es-ES" {...form.register('startDate')} />
              {form.formState.errors.startDate?.message && (
                <p className="text-sm text-destructive">{form.formState.errors.startDate.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-end-date">Fecha de fin</Label>
              <Input id="edit-end-date" type="date" lang="es-ES" {...form.register('endDate')} />
              {form.formState.errors.endDate?.message && (
                <p className="text-sm text-destructive">{form.formState.errors.endDate.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="edit-price">Precio ({rental.price.currency})</Label>
              <Input
                id="edit-price"
                type="number"
                min={0}
                step={0.01}
                disabled={!canEditPrice}
                {...form.register('priceAmount', { valueAsNumber: true })}
              />
              {form.formState.errors.priceAmount?.message && (
                <p className="text-sm text-destructive">{form.formState.errors.priceAmount.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-deposit">Fianza ({rental.deposit.currency})</Label>
              <Input
                id="edit-deposit"
                type="number"
                min={0}
                step={0.01}
                disabled={!canEditPrice}
                {...form.register('depositAmount', { valueAsNumber: true })}
              />
              {form.formState.errors.depositAmount?.message && (
                <p className="text-sm text-destructive">{form.formState.errors.depositAmount.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleRecalculate}
              disabled={isCalculating || isSaving || !canEditPrice}
            >
              {isCalculating ? 'Calculando...' : 'Recalcular desde producto'}
            </Button>
            <Button type="submit" disabled={isSaving || isCalculating}>
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RentalEditableCard;
