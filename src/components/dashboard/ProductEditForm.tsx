
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Product } from '../products/ProductCard';
import { Form } from '@/components/ui/form';

import ProductBasicInfoFields from './forms/ProductBasicInfoFields';
import ProductPriceFields from './forms/ProductPriceFields';
import ProductImagesField from './forms/ProductImagesField';
import ProductFormActions from './forms/ProductFormActions';
import { 
  ProductFormValues, 
  productFormSchema, 
  mapProductToFormValues, 
  mapFormValuesToProduct 
} from './forms/productFormSchema';

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
    defaultValues: mapProductToFormValues(product),
  });

  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      // En una aplicación real, esto enviaría datos a una API backend
      console.log('Guardando producto:', values);
      
      // Crear objeto de producto actualizado
      const updatedProduct = mapFormValuesToProduct(values, product);
      
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
        <ProductBasicInfoFields control={form.control} />
        <ProductPriceFields control={form.control} />
        <ProductImagesField control={form.control} />
        <ProductFormActions isSubmitting={isSubmitting} onCancel={onCancel} />
      </form>
    </Form>
  );
};

export default ProductEditForm;
