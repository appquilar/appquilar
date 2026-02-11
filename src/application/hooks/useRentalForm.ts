import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/components/ui/use-toast';
import { rentalService } from '@/compositionRoot';
import { RentalFormValues, rentalFormSchema, defaultRentalFormValues } from '@/domain/models/RentalForm';

const toCents = (value: number) => Math.round((Number.isFinite(value) ? value : 0) * 100);

export const useRentalForm = () => {
  const navigate = useNavigate();

  const form = useForm<RentalFormValues>({
    resolver: zodResolver(rentalFormSchema),
    defaultValues: defaultRentalFormValues,
  });

  const onSubmit = async (data: RentalFormValues) => {
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

      navigate('/dashboard/rentals');
    } catch (error) {
      console.error('Error creating rental:', error);
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
