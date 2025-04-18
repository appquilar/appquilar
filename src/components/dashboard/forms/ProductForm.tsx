import React, { useEffect } from 'react';
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
  
  // Ensure the form's initial tab matches the product type
  useEffect(() => {
    const productType = form.getValues('productType');
    const currentTab = form.getValues('currentTab');
    
    // If on basic info tab, do nothing
    if (currentTab === 'basic') return;
    
    // Otherwise, sync the tab with the product type
    if (productType === 'rental' && currentTab !== 'rental') {
      form.setValue('currentTab', 'rental');
    } else if (productType === 'sale' && currentTab !== 'secondhand') {
      form.setValue('currentTab', 'secondhand');
    }
  }, [form]);
  
  // Update tabs when product type changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'productType') {
        // Update the isRentable and isForSale flags when productType changes
        if (value.productType === 'rental') {
          form.setValue('isRentable', true);
          form.setValue('isForSale', false);
          
          // Switch to rental tab
          form.setValue('currentTab', 'rental');
        } else if (value.productType === 'sale') {
          form.setValue('isRentable', false);
          form.setValue('isForSale', true);
          
          // Switch to secondhand tab
          form.setValue('currentTab', 'secondhand');
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);
  
  // Function to handle tab selection
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
          <Tabs 
            value={form.watch('currentTab') || 'basic'} 
            onValueChange={handleTabChange} 
            className="w-full"
          >
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
