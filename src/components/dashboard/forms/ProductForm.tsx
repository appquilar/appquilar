
import { Form } from '@/components/ui/form';
import { Product } from '@/domain/models/Product';
import ProductBasicInfoFields from './ProductBasicInfoFields';
import ProductPriceFields from './ProductPriceFields';
import ProductImagesField from './ProductImagesField';
import ProductAvailabilityFields from './ProductAvailabilityFields';
import ProductFormActions from './ProductFormActions';
import ProductSecondHandFields from './ProductSecondHandFields';
import ProductTypeSelector from './ProductTypeSelector';
import { useProductForm } from './hooks/useProductForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect } from 'react';

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

  // Update tabs when product type changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'productType') {
        // Update the isRentable and isForSale flags when productType changes
        if (value.productType === 'rental') {
          form.setValue('isRentable', true);
          form.setValue('isForSale', false);
        } else if (value.productType === 'sale') {
          form.setValue('isRentable', false);
          form.setValue('isForSale', true);
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Product type selection */}
        <ProductTypeSelector control={form.control} />

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Información Básica</TabsTrigger>
            <TabsTrigger value="rental" disabled={form.watch('productType') !== 'rental'}>Alquiler</TabsTrigger>
            <TabsTrigger value="secondhand" disabled={form.watch('productType') !== 'sale'}>Segunda Mano</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 pt-4">
            <ProductBasicInfoFields control={form.control} />
            {/* Image upload form in basic tab */}
            <ProductImagesField control={form.control} />
          </TabsContent>
          
          <TabsContent value="rental" className="space-y-4 pt-4">
            <ProductPriceFields control={form.control} />
            <ProductAvailabilityFields control={form.control} />
          </TabsContent>
          
          <TabsContent value="secondhand" className="space-y-4 pt-4">
            <ProductSecondHandFields control={form.control} />
          </TabsContent>
        </Tabs>
        
        <ProductFormActions isSubmitting={isSubmitting} onCancel={onCancel} />
      </form>
    </Form>
  );
};

export default ProductForm;
