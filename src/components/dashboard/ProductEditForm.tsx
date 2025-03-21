
import { Product } from '../products/ProductCard';
import ProductForm from './forms/ProductForm';

interface ProductEditFormProps {
  product: Product;
  onSave: (product: Partial<Product>) => void;
  onCancel: () => void;
}

const ProductEditForm = ({ product, onSave, onCancel }: ProductEditFormProps) => {
  return (
    <ProductForm 
      product={product}
      onSave={onSave}
      onCancel={onCancel}
    />
  );
};

export default ProductEditForm;
