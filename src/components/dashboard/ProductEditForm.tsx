
import { Product } from '@/domain/models/Product';
import ProductForm from './forms/ProductForm';

interface ProductEditFormProps {
  product: Product;
  onSave: (product: Partial<Product>) => void;
  onCancel: () => void;
  disableSubmit?: boolean;
}

const ProductEditForm = ({ product, onSave, onCancel, disableSubmit = false }: ProductEditFormProps) => {
  return (
    <ProductForm 
      product={product}
      onSave={onSave}
      onCancel={onCancel}
      disableSubmit={disableSubmit}
    />
  );
};

export default ProductEditForm;
