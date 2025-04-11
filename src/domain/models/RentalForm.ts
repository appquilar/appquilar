
import { z } from 'zod';

/**
 * Validation schema for rental creation form
 */
export const rentalFormSchema = z.object({
  product: z.string().min(2, { message: 'El producto es requerido' }),
  customerId: z.string().min(1, { message: 'El cliente es requerido' }),
  customerName: z.string().min(2, { message: 'El nombre del cliente es requerido' }),
  customerEmail: z.string().email({ message: 'Email inválido' }),
  customerPhone: z.string().min(6, { message: 'El teléfono es requerido' }),
  startDate: z.date({ required_error: 'Fecha de inicio requerida' }),
  endDate: z.date({ required_error: 'Fecha de fin requerida' }),
  totalAmount: z.number().min(0, { message: 'El monto debe ser mayor a 0' }),
  depositAmount: z.number().min(0, { message: 'La fianza debe ser mayor o igual a 0' }).optional(),
});

/**
 * Type for rental form values
 */
export type RentalFormValues = z.infer<typeof rentalFormSchema>;

/**
 * Default values for the rental form
 */
export const defaultRentalFormValues: Partial<RentalFormValues> = {
  startDate: new Date(),
  endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
  totalAmount: 0,
  depositAmount: 0,
};
