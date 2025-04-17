
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Product } from '@/domain/models/Product';
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

  // Initialize form with existing product values and add productType
  const formValues = mapProductToFormValues(product);
  
  // Determine the initial tab based on product type
  let initialTab = 'basic';
  if (product.productType) {
    initialTab = 'basic'; // Always start at basic
  }
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      ...formValues,
      productType: product.productType || (product.isRentable ? 'rental' : 'sale'),
      currentTab: initialTab,
      images: []
    },
    mode: 'onChange', // Enable onChange mode for better reactivity
  });

  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      // Set isRentable and isForSale based on productType
      values.isRentable = values.productType === 'rental';
      values.isForSale = values.productType === 'sale';
      
      // Validation for selected options
      if (values.isForSale && (!values.secondHand || !values.secondHand.price)) {
        form.setError('secondHand.price', { 
          type: 'manual', 
          message: 'El precio de venta es obligatorio para productos en venta' 
        });
        setIsSubmitting(false);
        return;
      }
      
      if (values.isRentable && !values.price.daily) {
        form.setError('price.daily', { 
          type: 'manual', 
          message: 'El precio diario es obligatorio para productos en alquiler' 
        });
        setIsSubmitting(false);
        return;
      }
      
      // Create updated product object
      const updatedProduct = mapFormValuesToProduct(values, product);
      
      // Handle image uploads if needed
      if (values.images && values.images.length > 0) {
        // Find the primary image
        const primaryImage = values.images.find((img: any) => img.isPrimary);
        if (primaryImage) {
          // Set the imageUrl and thumbnailUrl to the primary image URL
          updatedProduct.imageUrl = primaryImage.url;
          updatedProduct.thumbnailUrl = primaryImage.url;
        }
      }
      
      // Call onSave callback with the updated product
      onSave(updatedProduct);
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
