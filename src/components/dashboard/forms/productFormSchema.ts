
import { z } from 'zod';
import { Product, AvailabilityPeriod } from '@/domain/models/Product';

export const productFormSchema = z.object({
  internalId: z.string().optional(),
  name: z.string().min(1, { message: 'El nombre es obligatorio' }),
  slug: z.string().min(1, { message: 'El slug es obligatorio' }),
  description: z.string().min(1, { message: 'La descripción es obligatoria' }),
  imageUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  price: z.object({
    daily: z.coerce.number().default(0),
    weekly: z.coerce.number().optional(),
    monthly: z.coerce.number().optional(),
    hourly: z.coerce.number().optional(),
    deposit: z.coerce.number().optional(),
  }),
  secondHand: z.object({
    price: z.coerce.number().default(0),
    negotiable: z.boolean().default(false),
    additionalInfo: z.string().optional(),
  }).optional(),
  isRentable: z.boolean().optional(),
  isForSale: z.boolean().optional(),
  productType: z.enum(['rental', 'sale']),
  category: z.object({
    id: z.string().nullable(),
    name: z.string().optional(),
    slug: z.string().optional(),
  }),
  availability: z.array(
    z.object({
      id: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      status: z.enum(['available', 'unavailable']),
      includeWeekends: z.boolean(),
    })
  ).default([]),
  isAlwaysAvailable: z.boolean().optional(),
  unavailableDates: z.array(z.string()).default([]),
  availabilitySchedule: z.record(
    z.array(
      z.object({
        startTime: z.string(),
        endTime: z.string(),
      })
    )
  ).optional(),
  // Field to track current tab in mobile view
  currentTab: z.string().optional(),
  // Add images field to the schema
  images: z.array(z.any()).default([]),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

// Helper function to convert Product to form values
export const mapProductToFormValues = (product: Product): ProductFormValues => {
  return {
    internalId: product.internalId || '',
    name: product.name || '',
    slug: product.slug || '',
    description: product.description || '',
    imageUrl: product.imageUrl || '',
    thumbnailUrl: product.thumbnailUrl || '',
    price: {
      daily: product.price?.daily || 0,
      weekly: product.price?.weekly,
      monthly: product.price?.monthly,
      hourly: product.price?.hourly,
      deposit: product.price?.deposit,
    },
    secondHand: product.secondHand ? {
      price: product.secondHand.price || 0,
      negotiable: product.secondHand.negotiable || false,
      additionalInfo: product.secondHand.additionalInfo || '',
    } : undefined,
    isRentable: product.isRentable,
    isForSale: product.isForSale,
    productType: product.productType || (product.isRentable ? 'rental' : 'sale'),
    category: {
      id: product.category?.id || null,
      name: product.category?.name || '',
      slug: product.category?.slug || '',
    },
    availability: (product.availability || []).map(item => ({
      id: item.id || `avail-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      status: item.status || 'available',
      includeWeekends: item.includeWeekends || false
    })),
    isAlwaysAvailable: product.isAlwaysAvailable || false,
    unavailableDates: product.unavailableDates || [],
    availabilitySchedule: product.availabilitySchedule ? 
      Object.fromEntries(
        Object.entries(product.availabilitySchedule).map(([day, ranges]) => [
          day,
          ranges.map(range => ({
            startTime: range.startTime || '08:00', // Ensure default value if missing
            endTime: range.endTime || '18:00'      // Ensure default value if missing
          }))
        ])
      )
      : undefined,
    images: [], // Initialize empty images array
  };
};

// Helper function to convert form values back to Product
export const mapFormValuesToProduct = (values: ProductFormValues, originalProduct: Product): Partial<Product> => {
  // Get selected category details if a category was selected
  const category = values.category.id ? {
    id: values.category.id,
    name: values.category.name || '',
    slug: values.category.slug || '',
  } : originalProduct.category;

  // Process secondHand with required fields
  const secondHand = values.secondHand ? {
    price: values.secondHand.price || 0, // Ensure default value
    negotiable: values.secondHand.negotiable || false, // Ensure default value
    additionalInfo: values.secondHand.additionalInfo
  } : undefined;

  // Process availabilitySchedule with required fields
  const availabilitySchedule = values.availabilitySchedule ? 
    Object.fromEntries(
      Object.entries(values.availabilitySchedule).map(([day, ranges]) => [
        day,
        ranges.map(range => ({
          startTime: range.startTime, // Already guaranteed by the schema
          endTime: range.endTime      // Already guaranteed by the schema
        }))
      ])
    )
    : undefined;

  return {
    ...originalProduct,
    internalId: values.internalId,
    name: values.name,
    slug: values.slug,
    description: values.description,
    imageUrl: values.imageUrl,
    thumbnailUrl: values.thumbnailUrl,
    price: {
      daily: values.price.daily || 0,
      weekly: values.price.weekly,
      monthly: values.price.monthly,
      hourly: values.price.hourly,
      deposit: values.price.deposit,
    },
    secondHand,
    isRentable: values.isRentable,
    isForSale: values.isForSale,
    productType: values.productType,
    category,
    availability: values.availability as AvailabilityPeriod[],
    isAlwaysAvailable: values.isAlwaysAvailable,
    unavailableDates: values.unavailableDates,
    availabilitySchedule,
  };
};
