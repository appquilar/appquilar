
import { Form } from '@/components/ui/form';
import { Product } from '@/components/products/ProductCard';
import ProductBasicInfoFields from './ProductBasicInfoFields';
import ProductPriceFields from './ProductPriceFields';
import ProductImagesField from './ProductImagesField';
import ProductAvailabilityFields from './ProductAvailabilityFields';
import ProductFormActions from './ProductFormActions';
import { useProductForm } from './hooks/useProductForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Información Básica</TabsTrigger>
            <TabsTrigger value="images">Imágenes</TabsTrigger>
            <TabsTrigger value="availability">Disponibilidad</TabsTrigger>
          </TabsList>
          <TabsContent value="basic" className="space-y-4 pt-4">
            <ProductBasicInfoFields control={form.control} />
            <ProductPriceFields control={form.control} />
          </TabsContent>
          <TabsContent value="images" className="space-y-4 pt-4">
            <ProductImagesField control={form.control} />
          </TabsContent>
          <TabsContent value="availability" className="space-y-4 pt-4">
            <ProductAvailabilityFields control={form.control} />
          </TabsContent>
        </Tabs>
        
        <ProductFormActions isSubmitting={isSubmitting} onCancel={onCancel} />
      </form>
    </Form>
  );
};

export default ProductForm;
