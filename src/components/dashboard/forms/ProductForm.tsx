
import { Form } from '@/components/ui/form';
import { Product } from '@/components/products/ProductCard';
import ProductBasicInfoFields from './ProductBasicInfoFields';
import ProductPriceFields from './ProductPriceFields';
import ProductImagesField from './ProductImagesField';
import ProductFormActions from './ProductFormActions';
import { useProductForm } from './hooks/useProductForm';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

interface ProductFormProps {
  product: Product;
  onSave: (product: Partial<Product>) => void;
  onCancel: () => void;
}

const ProductForm = ({ product, onSave, onCancel }: ProductFormProps) => {
  const { form, isSubmitting, onSubmit } = useProductForm({
    product,
    onSave,
    onCancel
  });
  
  const [internalId, setInternalId] = useState(product.internalId || '');
  
  // Update internalId if product changes
  useEffect(() => {
    setInternalId(product.internalId || '');
  }, [product]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Internal ID (readonly) */}
        <div className="mb-4">
          <label htmlFor="internalId" className="text-sm font-medium mb-2 block">
            ID Interno
          </label>
          <Input
            id="internalId"
            value={internalId}
            readOnly
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Identificador único generado automáticamente
          </p>
        </div>
        
        <ProductBasicInfoFields control={form.control} />
        <ProductPriceFields control={form.control} />
        <ProductImagesField control={form.control} />
        <ProductFormActions isSubmitting={isSubmitting} onCancel={onCancel} />
      </form>
    </Form>
  );
};

export default ProductForm;
