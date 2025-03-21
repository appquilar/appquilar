
import { Form } from '@/components/ui/form';
import { Product } from '@/components/products/ProductCard';
import ProductBasicInfoFields from './ProductBasicInfoFields';
import ProductPriceFields from './ProductPriceFields';
import ProductImagesField from './ProductImagesField';
import ProductFormActions from './ProductFormActions';
import { useProductForm } from './hooks/useProductForm';
import { ProductFormValues } from './productFormSchema';

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

export default ProductForm;
