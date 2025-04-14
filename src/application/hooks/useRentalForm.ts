
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/components/ui/use-toast';
import { RentalService } from '@/application/services/RentalService';
import { RentalFormValues, rentalFormSchema, defaultRentalFormValues } from '@/domain/models/RentalForm';

export const useRentalForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const rentalService = RentalService.getInstance();

  // Initialize form with schema validation
  const form = useForm<RentalFormValues>({
    resolver: zodResolver(rentalFormSchema),
    defaultValues: defaultRentalFormValues,
  });

  // Handle form submission
  const handleSubmit = async (data: RentalFormValues) => {
    setIsSubmitting(true);
    try {
      // Prepare rental object
      const rental = {
        product: data.product,
        customer: {
          id: data.customerId,
          name: data.customerName,
          email: data.customerEmail,
          phone: data.customerPhone,
        },
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        totalAmount: data.totalAmount,
        depositAmount: data.depositAmount || 0,
        status: 'upcoming' as const,
        returned: false,
      };

      // Create rental
      await rentalService.createRental(rental);
      
      toast({
        title: "Alquiler creado",
        description: "El alquiler ha sido creado exitosamente",
      });
      
      navigate('/dashboard/rentals');
    } catch (error) {
      console.error('Error creating rental:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el alquiler",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    onSubmit: handleSubmit
  };
};
