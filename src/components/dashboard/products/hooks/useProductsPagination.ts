
import { useState } from 'react';
import { Product } from '@/components/products/ProductCard';

interface UseProductsPaginationProps {
  filteredProducts: Product[];
  productsPerPage?: number;
}

export function useProductsPagination({ 
  filteredProducts, 
  productsPerPage = 8 
}: UseProductsPaginationProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculate pagination values
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to first page
  const resetPagination = () => {
    setCurrentPage(1);
  };

  return {
    currentPage,
    totalPages,
    currentProducts,
    handlePageChange,
    resetPagination
  };
}
