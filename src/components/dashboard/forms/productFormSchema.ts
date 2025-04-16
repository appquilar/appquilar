
import { z } from 'zod';
import { Product, AvailabilityPeriod } from '@/domain/models/Product';
import { ImageFile } from './image-upload/types';

export const productFormSchema = z.object({
  internalId: z.string().optional(),
  name: z.string().min(1, 'El nombre es obligatorio'),
  slug: z.string().min(1, 'El slug es obligatorio'),
  description: z.string().min(1, 'La descripción es obligatoria'),
  images: z.array(z.custom<ImageFile>()).optional(),
  imageUrl: z.string().url('URL de imagen inválida'),
  thumbnailUrl: z.string().url('URL de miniatura inválida').optional(),
  price: z.object({
    daily: z.number().min(0, 'El precio diario debe ser mayor o igual a 0'),
    weekly: z.number().min(0, 'El precio semanal debe ser mayor o igual a 0').optional(),
    monthly: z.number().min(0, 'El precio mensual debe ser mayor o igual a 0').optional(),
    hourly: z.number().min(0, 'El precio por hora debe ser mayor o igual a 0').optional(),
    deposit: z.number().min(0, 'El depósito debe ser mayor o igual a 0').optional(),
  }),
  secondHand: z.object({
    price: z.number().min(0, 'El precio de venta debe ser mayor o igual a 0'),
    negotiable: z.boolean().default(false),
    additionalInfo: z.string().optional(),
  }).optional(),
  productType: z.enum(['rental', 'sale']).default('rental'),
  isRentable: z.boolean().default(true),
  isForSale: z.boolean().default(false),
  companyId: z.string().min(1, 'La empresa es obligatoria'),
  categoryId: z.string().min(1, 'La categoría es obligatoria'),
  availability: z.array(
    z.object({
      id: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      status: z.enum(['available', 'unavailable']),
      includeWeekends: z.boolean(),
    })
  ).optional(),
  isAlwaysAvailable: z.boolean().default(true),
  unavailableDates: z.array(z.string()).optional(),
  // Fix the type definition for availabilitySchedule to ensure startTime and endTime are required
  availabilitySchedule: z.record(
    z.array(
      z.object({
        startTime: z.string().min(1).default('08:00'),  // Ensure it's required and non-empty with default
        endTime: z.string().min(1).default('18:00')     // Ensure it's required and non-empty with default
      })
    )
  ).optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

/**
 * Map a Product model to form values
 */
export const mapProductToFormValues = (product: Product): ProductFormValues => {
  // Create a properly typed availabilitySchedule with non-optional properties
  let typedAvailabilitySchedule: Record<string, Array<{ startTime: string; endTime: string }>> | undefined = undefined;
  
  if (product.availabilitySchedule) {
    typedAvailabilitySchedule = {};
    Object.entries(product.availabilitySchedule).forEach(([day, timeSlots]) => {
      typedAvailabilitySchedule![day] = timeSlots.map(slot => ({
        startTime: slot.startTime || '08:00',  // Ensure non-optional with default
        endTime: slot.endTime || '18:00'       // Ensure non-optional with default
      }));
    });
  }
  
  return {
    internalId: product.internalId,
    name: product.name,
    slug: product.slug,
    description: product.description,
    imageUrl: product.imageUrl,
    thumbnailUrl: product.thumbnailUrl,
    price: {
      daily: product.price.daily,
      weekly: product.price.weekly,
      monthly: product.price.monthly,
      hourly: product.price.hourly,
      deposit: product.price.deposit,
    },
    secondHand: product.secondHand,
    productType: product.productType || (product.isRentable ? 'rental' : 'sale'),
    isRentable: product.isRentable ?? true,
    isForSale: product.isForSale ?? false,
    companyId: product.company.id,
    categoryId: product.category.id,
    availability: product.availability,
    isAlwaysAvailable: product.isAlwaysAvailable ?? true,
    unavailableDates: product.unavailableDates,
    availabilitySchedule: typedAvailabilitySchedule
  };
};

/**
 * Map form values to a Product model
 */
export const mapFormValuesToProduct = (values: ProductFormValues, product: Product): Partial<Product> => {
  // Ensure the availabilitySchedule has non-optional properties
  let typedAvailabilitySchedule: Record<string, Array<{ startTime: string; endTime: string }>> | undefined = undefined;
  
  if (values.availabilitySchedule) {
    typedAvailabilitySchedule = {};
    Object.entries(values.availabilitySchedule).forEach(([day, timeSlots]) => {
      typedAvailabilitySchedule![day] = timeSlots.map(slot => ({
        startTime: slot.startTime || '08:00',  // Ensure non-optional with default
        endTime: slot.endTime || '18:00'       // Ensure non-optional with default
      }));
    });
  }
  
  // Ensure the core object structure conforms to the Product type
  const updatedProduct: Partial<Product> = {
    internalId: values.internalId ?? product.internalId,
    name: values.name,
    slug: values.slug,
    description: values.description,
    imageUrl: values.imageUrl,
    thumbnailUrl: values.thumbnailUrl,
    price: {
      // Ensure daily is always present as it's required
      daily: values.price.daily,
      weekly: values.price.weekly,
      monthly: values.price.monthly,
      hourly: values.price.hourly,
      deposit: values.price.deposit,
    },
    secondHand: values.secondHand ? {
      // Ensure price and negotiable are always present as required
      price: values.secondHand.price,
      negotiable: values.secondHand.negotiable ?? false,
      additionalInfo: values.secondHand.additionalInfo,
    } : undefined,
    productType: values.productType,
    isRentable: values.isRentable,
    isForSale: values.isForSale,
    company: product.company, // Preserve the company structure
    category: product.category, // Preserve the category structure
    availability: values.availability as AvailabilityPeriod[], // Type assertion to ensure compatibility
    isAlwaysAvailable: values.isAlwaysAvailable,
    unavailableDates: values.unavailableDates,
    availabilitySchedule: typedAvailabilitySchedule,
  };
  
  return updatedProduct;
};
