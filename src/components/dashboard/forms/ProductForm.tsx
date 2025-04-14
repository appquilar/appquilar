
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
        {/* Product type switches */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="isRentable"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Disponible para alquiler</FormLabel>
                  <FormDescription>
                    Este producto puede ser alquilado
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="isForSale"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Disponible para venta</FormLabel>
                  <FormDescription>
                    Este producto está en venta de segunda mano
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Información Básica</TabsTrigger>
            <TabsTrigger value="images">Imágenes</TabsTrigger>
            <TabsTrigger value="rental" disabled={!form.watch('isRentable')}>Alquiler</TabsTrigger>
            <TabsTrigger value="secondhand" disabled={!form.watch('isForSale')}>Segunda Mano</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 pt-4">
            <ProductBasicInfoFields control={form.control} />
          </TabsContent>
          
          <TabsContent value="images" className="space-y-4 pt-4">
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
