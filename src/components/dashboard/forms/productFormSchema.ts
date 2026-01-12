import { z } from 'zod';
import { Product } from '@/domain/models/Product';

export const productFormSchema = z.object({
    internalId: z.string().optional(),
    name: z.string().min(1, { message: 'El nombre es obligatorio' }),
    slug: z.string().min(1, { message: 'El slug es obligatorio' }),
    description: z.string().min(1, { message: 'La descripción es obligatoria' }),
    imageUrl: z.string().optional(),
    thumbnailUrl: z.string().optional(),
    price: z.object({
        daily: z.coerce.number().default(0),
        deposit: z.coerce.number().optional(),
        tiers: z.array(z.object({
            daysFrom: z.coerce.number().min(1, { message: 'Debe ser al menos 1' }),
            daysTo: z.coerce.number().optional(),
            // Use refined validation to ensure it is not NaN (empty input)
            pricePerDay: z.any()
                .transform((val) => Number(val))
                .refine((val) => !isNaN(val) && val >= 0, { message: 'Precio obligatorio' }),
        })).optional(),
    }),
    // Second hand optional and relaxed since we hid it
    secondHand: z.object({
        price: z.coerce.number().optional(),
        negotiable: z.boolean().optional(),
        additionalInfo: z.string().optional(),
    }).optional(),
    isRentable: z.boolean().optional(),
    isForSale: z.boolean().optional(),
    productType: z.enum(['rental', 'sale']),
    category: z.object({
        id: z.string().min(1, { message: "La categoría es obligatoria" }).nullable(),
        name: z.string().optional(),
        slug: z.string().optional(),
    }),
    currentTab: z.string().optional(),
    images: z.array(z.any()).default([]),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

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
            deposit: product.price?.deposit,
            tiers: product.price?.tiers?.map(tier => ({
                daysFrom: tier.daysFrom,
                daysTo: tier.daysTo,
                pricePerDay: tier.pricePerDay
            })) || [],
        },
        secondHand: undefined,
        isRentable: true,
        isForSale: false,
        productType: 'rental',
        category: {
            id: product.category?.id || null,
            name: product.category?.name || '',
            slug: product.category?.slug || '',
        },
        images: [],
    };
};

export const mapFormValuesToProduct = (values: ProductFormValues, originalProduct: Product): Partial<Product> => {
    const category = values.category.id ? {
        id: values.category.id,
        name: values.category.name || '',
        slug: values.category.slug || '',
    } : originalProduct.category;

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
            deposit: values.price.deposit,
            tiers: values.price.tiers?.map(tier => ({
                daysFrom: tier.daysFrom,
                daysTo: tier.daysTo,
                pricePerDay: tier.pricePerDay
            })) || [],
        },
        isRentable: true,
        isForSale: false,
        productType: 'rental',
        category,
    };
};