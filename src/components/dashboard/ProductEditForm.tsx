
import { Product } from '@/domain/models/Product';
import ProductForm from './forms/ProductForm';

interface ProductEditFormProps {
  product: Product;
  onSave: (product: Partial<Product>) => void;
  onCancel: () => void;
  disableSubmit?: boolean;
  inventoryOwnerType: 'company' | 'user';
  enableInventoryQuery?: boolean;
}

const ProductEditForm = ({
  product,
  onSave,
  onCancel,
  disableSubmit = false,
  inventoryOwnerType,
  enableInventoryQuery = true,
}: ProductEditFormProps) => {
  return (
    <ProductForm 
      product={product}
      onSave={onSave}
      onCancel={onCancel}
      disableSubmit={disableSubmit}
      inventoryOwnerType={inventoryOwnerType}
      enableInventoryQuery={enableInventoryQuery}
    />
  );
};

export default ProductEditForm;
