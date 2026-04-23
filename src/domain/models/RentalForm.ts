import { z } from 'zod';

const normalizeDecimalInput = (value: string) => value.replace(',', '.').trim();

const requiredNonNegativeAmountSchema = (requiredMessage: string, invalidMessage: string) =>
  z.union([z.string(), z.number()]).transform((value, ctx) => {
    if (typeof value === 'number') {
      if (Number.isFinite(value) && value >= 0) {
        return value;
      }

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: invalidMessage,
      });

      return z.NEVER;
    }

    const normalized = normalizeDecimalInput(value);

    if (normalized === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: requiredMessage,
      });

      return z.NEVER;
    }

    const parsedValue = Number(normalized);

    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: invalidMessage,
      });

      return z.NEVER;
    }

    return parsedValue;
  });

export const rentalFormSchema = z.object({
  rentId: z.string().min(1, { message: 'El ID del alquiler es requerido' }),
  productId: z.string().min(1, { message: 'El producto es requerido' }),
  renterEmail: z.string().trim().email({ message: 'Debes introducir un email válido' }),
  renterName: z.string().trim().max(255, { message: 'El nombre no puede exceder 255 caracteres' }).optional(),
  startDate: z.date({ required_error: 'Fecha de inicio requerida' }),
  endDate: z.date({ required_error: 'Fecha de fin requerida' }),
  requestedQuantity: z.coerce.number().int().min(1, { message: 'La cantidad debe ser al menos 1' }).default(1),
  priceAmount: requiredNonNegativeAmountSchema('El importe es obligatorio', 'El importe debe ser mayor o igual a 0'),
  priceCurrency: z.string().min(3, { message: 'La moneda es requerida' }),
  depositAmount: requiredNonNegativeAmountSchema('La fianza es obligatoria', 'La fianza debe ser mayor o igual a 0'),
  depositCurrency: z.string().min(3, { message: 'La moneda es requerida' }),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['endDate'],
});

export type RentalFormValues = z.input<typeof rentalFormSchema>;
export type RentalFormSubmitValues = z.output<typeof rentalFormSchema>;

export const defaultRentalFormValues: Partial<RentalFormValues> = {
  rentId: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : '',
  renterEmail: '',
  renterName: '',
  startDate: new Date(),
  endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
  requestedQuantity: 1,
  priceAmount: '',
  priceCurrency: 'EUR',
  depositAmount: '',
  depositCurrency: 'EUR',
};
