import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { rentalService } from '@/compositionRoot';
import { RentalFormSubmitValues, RentalFormValues, rentalFormSchema, defaultRentalFormValues } from '@/domain/models/RentalForm';
import { ApiError } from '@/infrastructure/http/ApiClient';

const toCents = (value: number) => Math.round((Number.isFinite(value) ? value : 0) * 100);
const isInventoryUnavailableError = (error: unknown): boolean =>
  error instanceof ApiError
  && error.status === 409
  && Array.isArray((error.payload as { error?: unknown[] } | undefined)?.error)
  && ((error.payload as { error?: unknown[] }).error ?? []).includes('product.inventory.unavailable');

export const useRentalForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<RentalFormValues, undefined, RentalFormSubmitValues>({
    resolver: zodResolver(rentalFormSchema),
    defaultValues: defaultRentalFormValues,
  });

  const onSubmit = async (data: RentalFormSubmitValues) => {
    form.clearErrors();

    try {
      await rentalService.createRent({
        rentId: data.rentId,
        productId: data.productId,
        renterEmail: data.renterEmail,
        renterName: data.renterName || null,
        startDate: data.startDate,
        endDate: data.endDate,
        deposit: {
          amount: toCents(data.depositAmount),
          currency: data.depositCurrency.toUpperCase(),
        },
        price: {
          amount: toCents(data.priceAmount),
          currency: data.priceCurrency.toUpperCase(),
        },
        isLead: false,
      });

      toast({
        title: 'Alquiler creado',
        description: 'El alquiler ha sido creado exitosamente',
      });

      await queryClient.invalidateQueries({ queryKey: ['rents'] });
      await queryClient.refetchQueries({ queryKey: ['rents'], type: 'all' });

      navigate('/dashboard/rentals');
    } catch (error) {
      console.error('Error creating rental:', error);

      if (isInventoryUnavailableError(error)) {
        form.setError('productId', {
          type: 'server',
          message: 'No hay stock disponible para ese producto en este momento.',
        });
        return;
      }

      toast({
        title: 'Error',
        description: 'No se pudo crear el alquiler',
        variant: 'destructive',
      });
    }
  };

  return {
    form,
    isSubmitting: form.formState.isSubmitting,
    onSubmit,
  };
};
