
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Product } from '../products/ProductCard';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

// Esquema de validación para el formulario de producto
const productFormSchema = z.object({
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

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductEditFormProps {
  product: Product;
  onSave: (product: Partial<Product>) => void;
  onCancel: () => void;
}

const ProductEditForm = ({ product, onSave, onCancel }: ProductEditFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializar formulario con los valores existentes del producto
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
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
    },
  });

  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      // En una aplicación real, esto enviaría datos a una API backend
      console.log('Guardando producto:', values);
      
      // Crear objeto de producto actualizado
      const updatedProduct: Partial<Product> = {
        ...product,
        name: values.name,
        description: values.description,
        price: {
          hourly: values.price.hourly,
          daily: values.price.daily, // Ahora esto está garantizado que esté presente
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
      
      // Simular retraso de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Llamar al callback onSave con el producto actualizado
      onSave(updatedProduct);
      toast.success('Producto actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      toast.error('Error al actualizar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Producto</FormLabel>
              <FormControl>
                <Input placeholder="Nombre de Herramienta Profesional" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe tu producto en detalle" 
                  className="min-h-[120px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price.daily"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio Diario (€)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="25" 
                    {...field}
                    onChange={e => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormDescription>Precio requerido por día</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price.hourly"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio por Hora (€)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="8" 
                    {...field}
                    onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>Tarifa por hora (opcional)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price.weekly"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio Semanal (€)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="120" 
                    {...field}
                    onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>Tarifa semanal (opcional)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price.monthly"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio Mensual (€)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="350" 
                    {...field}
                    onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>Tarifa mensual (opcional)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de la Imagen</FormLabel>
              <FormControl>
                <Input placeholder="https://ejemplo.com/imagen.jpg" {...field} />
              </FormControl>
              <FormDescription>URL de la imagen del producto</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductEditForm;
