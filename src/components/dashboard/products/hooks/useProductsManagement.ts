
import { useState } from 'react';
import { useProducts } from '@/application/hooks/useProducts';
import { toast } from 'sonner';

export const useProductsManagement = () => {
  const { products, isLoading, error, deleteProduct } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  // Filter products based on search query
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };
  
  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
      toast.success('Producto eliminado correctamente');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar el producto');
    }
  };
  
  return {
    searchQuery,
    setSearchQuery,
    currentPage,
    totalPages,
    filteredProducts: currentProducts,
    isLoading,
    error,
    handlePageChange,
    handleSearch,
    handleDeleteProduct
  };
};
