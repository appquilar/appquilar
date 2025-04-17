
import { useState } from 'react';
import { useProducts } from '@/application/hooks/useProducts';
import { toast } from 'sonner';
import { Product } from '@/domain/models/Product';
import { useNavigate } from 'react-router-dom';

export const useProductsManagement = () => {
  const navigate = useNavigate();
  const { products, isLoading, error, deleteProduct } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
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

  const openDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };
  
  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      await deleteProduct(productToDelete.id);
      toast.success('Producto eliminado correctamente');
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar el producto');
    }
  };

  const handleEditProduct = (productId: string) => {
    navigate(`/dashboard/products/${productId}`);
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
    isDeleteModalOpen,
    productToDelete,
    openDeleteModal,
    closeDeleteModal,
    confirmDeleteProduct,
    handleEditProduct
  };
};
