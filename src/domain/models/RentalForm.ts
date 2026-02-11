import { z } from 'zod';

export const rentalFormSchema = z.object({
  rentId: z.string().min(1, { message: 'El ID del alquiler es requerido' }),
  productId: z.string().min(1, { message: 'El producto es requerido' }),
  renterEmail: z.string().trim().email({ message: 'Debes introducir un email válido' }),
  renterName: z.string().trim().max(255, { message: 'El nombre no puede exceder 255 caracteres' }).optional(),
  startDate: z.date({ required_error: 'Fecha de inicio requerida' }),
  endDate: z.date({ required_error: 'Fecha de fin requerida' }),
  priceAmount: z.number().min(0, { message: 'El importe debe ser mayor o igual a 0' }),
  priceCurrency: z.string().min(3, { message: 'La moneda es requerida' }),
  depositAmount: z.number().min(0, { message: 'La fianza debe ser mayor o igual a 0' }),
  depositCurrency: z.string().min(3, { message: 'La moneda es requerida' }),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['endDate'],
});

export type RentalFormValues = z.infer<typeof rentalFormSchema>;

export const defaultRentalFormValues: Partial<RentalFormValues> = {
  rentId: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : '',
  renterEmail: '',
  renterName: '',
  startDate: new Date(),
  endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
  priceAmount: 0,
  priceCurrency: 'EUR',
  depositAmount: 0,
  depositCurrency: 'EUR',
};
