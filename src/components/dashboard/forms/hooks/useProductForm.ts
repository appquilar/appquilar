
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Product } from '@/components/products/ProductCard';
import { 
  ProductFormValues, 
  productFormSchema, 
  mapProductToFormValues, 
  mapFormValuesToProduct 
} from '../productFormSchema';

interface UseProductFormProps {
  product: Product;
  onSave: (product: Partial<Product>) => void;
  onCancel: () => void;
}

export const useProductForm = ({ product, onSave, onCancel }: UseProductFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with existing product values
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: mapProductToFormValues(product),
  });

  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      // In a real app, this would send data to a backend API
      console.log('Saving product:', values);
      
      // Create updated product object
      const updatedProduct = mapFormValuesToProduct(values, product);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Call onSave callback with the updated product
      onSave(updatedProduct);
      toast.success('Producto actualizado correctamente');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error al actualizar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    onSubmit,
    onCancel
  };
};
