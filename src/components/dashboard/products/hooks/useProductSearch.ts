
import { useState } from 'react';
import { Product } from '@/components/products/ProductCard';

export function useProductSearch(products: Product[]) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter products based on search query
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The actual filtering is done reactively above
  };

  return {
    searchQuery,
    setSearchQuery,
    filteredProducts,
    handleSearch
  };
}
