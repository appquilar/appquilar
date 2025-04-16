
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
import { useIsMobile } from '@/hooks/use-mobile';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

  const isMobile = useIsMobile();
  
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
  
  // Function to handle mobile tab selection
  const handleTabChange = (value: string) => {
    form.setValue('currentTab', value);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Product type selection */}
        <ProductTypeSelector control={form.control} />

        {/* Mobile Tabs using Select */}
        {isMobile && (
          <div className="w-full">
            <Select
              value={form.watch('currentTab') || 'basic'}
              onValueChange={handleTabChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Información Básica" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Información Básica</SelectItem>
                {form.watch('productType') === 'rental' && (
                  <SelectItem value="rental">Alquiler</SelectItem>
                )}
                {form.watch('productType') === 'sale' && (
                  <SelectItem value="secondhand">Segunda Mano</SelectItem>
                )}
              </SelectContent>
            </Select>
            
            <div className="mt-6">
              {(form.watch('currentTab') === 'basic' || !form.watch('currentTab')) && (
                <div className="space-y-4">
                  <ProductBasicInfoFields control={form.control} />
                  <ProductImagesField control={form.control} />
                </div>
              )}
              
              {form.watch('currentTab') === 'rental' && (
                <div className="space-y-4">
                  <ProductPriceFields control={form.control} />
                  <ProductAvailabilityFields control={form.control} />
                </div>
              )}
              
              {form.watch('currentTab') === 'secondhand' && (
                <div className="space-y-4">
                  <ProductSecondHandFields control={form.control} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Desktop Tabs using Tabs */}
        {!isMobile && (
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
        )}
        
        <ProductFormActions isSubmitting={isSubmitting} onCancel={onCancel} />
      </form>
    </Form>
  );
};

export default ProductForm;
