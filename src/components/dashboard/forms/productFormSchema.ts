
import { z } from "zod";
import { Product } from "@/components/products/ProductCard";

// Esquema de validación para el formulario de producto
export const productFormSchema = z.object({
  name: z.string().min(3, { message: 'El nombre del producto debe tener al menos 3 caracteres.' }),
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
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const mapProductToFormValues = (product: Product): ProductFormValues => {
  return {
    name: product.name,
    description: product.description,
    price: {
      hourly: product.price.hourly || undefined,
      daily: product.price.daily,
      weekly: product.price.weekly || undefined,
      monthly: product.price.monthly || undefined,
    },
    category: product.category,
    imageUrl: product.imageUrl,
  };
};

export const mapFormValuesToProduct = (values: ProductFormValues, product: Product): Partial<Product> => {
  return {
    ...product,
    name: values.name,
    description: values.description,
    price: {
      hourly: values.price.hourly,
      daily: values.price.daily,
      weekly: values.price.weekly,
      monthly: values.price.monthly,
    },
    imageUrl: values.imageUrl,
    thumbnailUrl: values.imageUrl, // Usando la misma URL para la miniatura por simplicidad
    category: {
      id: values.category.id,
      name: values.category.name,
      slug: product.category.slug, // Asegurar que se incluye el slug
    },
  };
};
