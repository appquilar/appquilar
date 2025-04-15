
import { Form } from '@/components/ui/form';
import { Product } from '@/domain/models/Product';
import ProductBasicInfoFields from './ProductBasicInfoFields';
import ProductPriceFields from './ProductPriceFields';
import ProductImagesField from './ProductImagesField';
import ProductAvailabilityFields from './ProductAvailabilityFields';
import ProductFormActions from './ProductFormActions';
import ProductSecondHandFields from './ProductSecondHandFields';
import { useProductForm } from './hooks/useProductForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { FormField, FormItem, FormLabel, FormDescription, FormControl } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

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
        {/* Product type selection */}
        <div className="space-y-4">
          <FormLabel className="text-base">Tipo de Producto</FormLabel>
          <FormDescription>
            Selecciona si este producto está disponible para alquilar o para venta de segunda mano
          </FormDescription>
          
          <FormField
            control={form.control}
            name="productType"
            render={({ field }) => (
              <RadioGroup
                onValueChange={(value) => {
                  // Update the type and the corresponding flags
                  field.onChange(value);
                  if (value === 'rental') {
                    form.setValue('isRentable', true);
                    form.setValue('isForSale', false);
                  } else {
                    form.setValue('isRentable', false);
                    form.setValue('isForSale', true);
                  }
                }}
                defaultValue={product.isRentable ? 'rental' : 'sale'}
                className="grid grid-cols-2 gap-4"
              >
                <FormItem>
                  <FormLabel asChild>
                    <div className={`flex flex-col items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-accent ${form.watch('productType') === 'rental' ? 'border-primary bg-accent' : 'border-input'}`}>
                      <RadioGroupItem value="rental" id="rental" className="sr-only" />
                      <Label htmlFor="rental" className="text-base font-semibold">Alquiler</Label>
                      <FormDescription>
                        Disponible para alquiler
                      </FormDescription>
                    </div>
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormLabel asChild>
                    <div className={`flex flex-col items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-accent ${form.watch('productType') === 'sale' ? 'border-primary bg-accent' : 'border-input'}`}>
                      <RadioGroupItem value="sale" id="sale" className="sr-only" />
                      <Label htmlFor="sale" className="text-base font-semibold">Venta</Label>
                      <FormDescription>
                        Venta de segunda mano
                      </FormDescription>
                    </div>
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            )}
          />
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Información Básica</TabsTrigger>
            <TabsTrigger value="rental" disabled={!form.watch('isRentable')}>Alquiler</TabsTrigger>
            <TabsTrigger value="secondhand" disabled={!form.watch('isForSale')}>Segunda Mano</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 pt-4">
            <ProductBasicInfoFields control={form.control} />
            <ProductImagesField control={form.control} />
          </TabsContent>
          
          <TabsContent value="rental" className="space-y-4 pt-4">
            <ProductPriceFields control={form.control} />
            <div className="max-h-[600px] overflow-y-auto px-1 pb-4">
              <ProductAvailabilityFields control={form.control} />
            </div>
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
