import { FormField, FormItem, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { Product } from '@/domain/models/Product';
import { RentalFormValues } from '@/domain/models/RentalForm';
import ProductSearch from './ProductSearch';
import SelectedProductDisplay from './SelectedProductDisplay';

interface ProductInfoFieldsProps {
  form: UseFormReturn<RentalFormValues>;
  productSearch: string;
  setProductSearch: (value: string) => void;
  selectedProduct: Product | null;
  filteredProducts: Product[];
  isLoading: boolean;
  handleProductSelect: (product: Product) => void;
}

const ProductInfoFields = ({
  form,
  productSearch,
  setProductSearch,
  selectedProduct,
  filteredProducts,
  isLoading,
  handleProductSelect
}: ProductInfoFieldsProps) => {
  return (
    <>
      <h2 className="text-xl font-medium">Información del Producto</h2>
      <div>
        <ProductSearch
          productSearch={productSearch}
          onSearchChange={setProductSearch}
          filteredProducts={filteredProducts}
          onProductSelect={handleProductSelect}
          isLoading={isLoading}
        />

        {selectedProduct && <SelectedProductDisplay product={selectedProduct} />}

        <FormField
          control={form.control}
          name="rentId"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <Input type="hidden" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <Input type="hidden" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        {form.formState.errors.productId?.message && (
          <p className="mt-2 text-sm text-destructive">{form.formState.errors.productId.message}</p>
        )}
      </div>
    </>
  );
};

export default ProductInfoFields;
