import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateLead } from '@/application/hooks/useRentals';
import { Input } from '@/components/ui/input';
import { useCalculateRentalCost } from '@/application/hooks/useProducts';
import { RentalCostBreakdown } from '@/domain/repositories/ProductRepository';
import { useEffect, useState } from 'react';

const messageSchema = z.object({
  message: z.string()
    .trim()
    .min(10, { message: 'El mensaje debe tener al menos 10 caracteres' })
    .max(1000, { message: 'El mensaje no puede exceder 1000 caracteres' }),
  startDate: z.string().min(1, { message: 'La fecha de inicio es obligatoria' }),
  endDate: z.string().min(1, { message: 'La fecha de fin es obligatoria' }),
}).refine((value) => value.endDate >= value.startDate, {
  message: 'La fecha de fin debe ser igual o posterior a la de inicio',
  path: ['endDate'],
});
type ContactFormValues = z.infer<typeof messageSchema>;

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  ownerName: string;
  initialStartDate?: string;
  initialEndDate?: string;
  initialCalculation?: RentalCostBreakdown | null;
}

const formatMoneyFromCents = (amount: number, currency: string): string => {
  const value = Number(amount || 0) / 100;
  return `${value.toFixed(2)} ${currency}`;
};

const ContactModal = ({
  isOpen,
  onClose,
  productId,
  productName,
  ownerName,
  initialStartDate,
  initialEndDate,
  initialCalculation,
}: ContactModalProps) => {
  const createLeadMutation = useCreateLead();
  const { mutateAsync: calculateRentalCost, isPending: isCalculating } = useCalculateRentalCost();
  const [calculation, setCalculation] = useState<RentalCostBreakdown | null>(initialCalculation ?? null);
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: '',
      startDate: initialStartDate ?? '',
      endDate: initialEndDate ?? '',
    },
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (initialStartDate) {
      form.setValue('startDate', initialStartDate);
    }
    if (initialEndDate) {
      form.setValue('endDate', initialEndDate);
    }
    if (initialCalculation) {
      setCalculation(initialCalculation);
    }
  }, [isOpen, initialStartDate, initialEndDate, initialCalculation, form]);

  const ensureCalculation = async (startDate: string, endDate: string): Promise<RentalCostBreakdown> => {
    const current = calculation;
    if (current && current.startDate === startDate && current.endDate === endDate) {
      return current;
    }

    const computed = await calculateRentalCost({
      productId,
      startDate,
      endDate,
    });

    setCalculation(computed);
    return computed;
  };

  const handleCalculate = async () => {
    const values = form.getValues();
    if (!values.startDate || !values.endDate) {
      form.trigger(['startDate', 'endDate']);
      return;
    }

    try {
      await ensureCalculation(values.startDate, values.endDate);
    } catch (_error) {
      toast.error('No se pudo calcular el precio');
    }
  };

  const handleSubmit = async (data: ContactFormValues) => {
    try {
      const computed = await ensureCalculation(data.startDate, data.endDate);

      await createLeadMutation.mutateAsync({
        productId,
        startDate: data.startDate,
        endDate: data.endDate,
        deposit: computed.deposit,
        price: computed.rentalPrice,
        message: data.message,
      });

      toast.success('Lead enviado correctamente', {
        description: `${ownerName} recibirá tu solicitud pronto`
      });

      form.reset({
        message: '',
        startDate: data.startDate,
        endDate: data.endDate,
      });
      onClose();
    } catch (error) {
      toast.error('Error al enviar la solicitud');
    }
  };

  const message = form.watch('message') || '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Contactar para alquilar</DialogTitle>
          <DialogDescription>
            Envía un mensaje a {ownerName} sobre "{productName}". Esto creará un lead en tu panel.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="lead-start-date">Fecha de inicio</Label>
              <Input
                id="lead-start-date"
                type="date"
                {...form.register('startDate', {
                  onChange: () => setCalculation(null),
                })}
              />
              {form.formState.errors.startDate?.message && (
                <p className="text-sm text-destructive">{form.formState.errors.startDate.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="lead-end-date">Fecha de fin</Label>
              <Input
                id="lead-end-date"
                type="date"
                {...form.register('endDate', {
                  onChange: () => setCalculation(null),
                })}
              />
              {form.formState.errors.endDate?.message && (
                <p className="text-sm text-destructive">{form.formState.errors.endDate.message}</p>
              )}
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleCalculate}
            disabled={createLeadMutation.isPending || isCalculating}
          >
            {isCalculating ? 'Calculando...' : 'Calcular precio'}
          </Button>

          {calculation && (
            <div className="rounded-md border bg-muted/20 p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Días</span>
                <span className="font-medium">{calculation.days}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Precio por día</span>
                <span className="font-medium">
                  {formatMoneyFromCents(calculation.pricePerDay.amount, calculation.pricePerDay.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal alquiler</span>
                <span className="font-medium">
                  {formatMoneyFromCents(calculation.rentalPrice.amount, calculation.rentalPrice.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fianza</span>
                <span className="font-medium">
                  {formatMoneyFromCents(calculation.deposit.amount, calculation.deposit.currency)}
                </span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-semibold">
                  {formatMoneyFromCents(calculation.totalPrice.amount, calculation.totalPrice.currency)}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="message">Mensaje</Label>
            <Textarea
              id="message"
              placeholder="Escribe tu mensaje aquí..."
              {...form.register('message')}
              rows={6}
              className={form.formState.errors.message ? 'border-destructive' : ''}
            />
            {form.formState.errors.message?.message && (
              <p className="text-sm text-destructive">{form.formState.errors.message.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {message.length}/1000 caracteres
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createLeadMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createLeadMutation.isPending || isCalculating}
            >
              {createLeadMutation.isPending ? 'Enviando...' : 'Enviar mensaje'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;
