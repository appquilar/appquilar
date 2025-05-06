
import { useState } from 'react';
import { toast } from 'sonner';
import { Product } from '@/components/products/ProductCard';

export function useProductOperations(initialProducts: Product[]) {
  const [products, setProducts] = useState(initialProducts);
  
  const handleDeleteProduct = (productId: string) => {
    // Eliminar el producto del estado
    setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
    toast.success(`Producto eliminado correctamente`);
  };

  return {
    products,
    handleDeleteProduct,
  };
}
