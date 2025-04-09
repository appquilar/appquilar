
import { useState } from 'react';
import { useProducts } from './useProducts';
import { Product } from '@/domain/models/Product';
import { UseFormReturn } from 'react-hook-form';
import { RentalFormValues } from '@/domain/models/RentalForm';

export const useProductSelection = (form: UseFormReturn<RentalFormValues>) => {
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { products, isLoading } = useProducts();

  // Filter products based on search input
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Handle product selection
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    form.setValue('product', product.name);
    // Calculate default rental price (7 days)
    form.setValue('totalAmount', product.price.weekly);
    setProductSearch('');
  };

  return {
    productSearch,
    setProductSearch,
    selectedProduct,
    filteredProducts,
    isLoading,
    handleProductSelect
  };
};
