
import { z } from "zod";
import { Product } from "@/components/products/ProductCard";
import { ImageFile } from "./image-upload/types";

// Esquema de validación para el formulario de producto
export const productFormSchema = z.object({
  internalId: z.string().optional(),
  name: z.string().min(3, { message: 'El nombre del producto debe tener al menos 3 caracteres.' }),
  slug: z.string().min(3, { message: 'El slug debe tener al menos 3 caracteres.' })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { 
      message: 'El slug solo puede contener letras minúsculas, números y guiones (-).' 
    }),
  description: z.string().min(10, { message: 'La descripción debe tener al menos 10 caracteres.' }),
  price: z.object({
    hourly: z.number().optional(),
    daily: z.number().min(1, { message: 'El precio diario es obligatorio.' }),
    weekly: z.number().optional(),
    monthly: z.number().optional(),
  }),
  category: z.object({
    id: z.string(),
    name: z.string()
  }),
  imageUrl: z.string().url({ message: 'Por favor introduce una URL válida.' }),
  // New field for images
  images: z.array(z.any()).optional(),
  // New field for availability periods
  availability: z.array(
    z.object({
      id: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      status: z.enum(['available', 'unavailable', 'pending', 'rented'])
    })
  ).optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const mapProductToFormValues = (product: Product): ProductFormValues => {
  return {
    internalId: product.internalId || '',
    name: product.name,
    slug: product.slug || '',
    description: product.description,
    price: {
      hourly: product.price.hourly || undefined,
      daily: product.price.daily,
      weekly: product.price.weekly || undefined,
      monthly: product.price.monthly || undefined,
    },
    category: product.category,
    imageUrl: product.imageUrl,
    images: [],
    availability: product.availability || [],
  };
};

export const mapFormValuesToProduct = (values: ProductFormValues, product: Product): Partial<Product> => {
  // Find primary image if it exists
  let primaryImageUrl = values.imageUrl;
  if (values.images && Array.isArray(values.images) && values.images.length > 0) {
    const primaryImage = values.images.find((img: ImageFile) => img.isPrimary);
    if (primaryImage) {
      primaryImageUrl = primaryImage.url;
    }
  }

  return {
    ...product,
    internalId: values.internalId,
    name: values.name,
    slug: values.slug,
    description: values.description,
    price: {
      hourly: values.price.hourly,
      daily: values.price.daily,
      weekly: values.price.weekly,
      monthly: values.price.monthly,
    },
    imageUrl: primaryImageUrl,
    thumbnailUrl: primaryImageUrl, // Usando la misma URL para la miniatura
    category: {
      id: values.category.id,
      name: values.category.name,
      slug: product.category.slug, // Asegurar que se incluye el slug de la categoría
    },
    availability: values.availability,
  };
};
