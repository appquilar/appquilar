
import { useProductOperations } from './useProductOperations';
import { useProductSearch } from './useProductSearch';
import { useProductsPagination } from './useProductsPagination';
import { MOCK_PRODUCTS } from './data/mockProducts';

export function useProductsManagement() {
  // Product operations (add, edit, delete)
  const {
    products,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isAddDialogOpen,
    setIsAddDialogOpen,
    selectedProduct,
    handleAddProduct,
    handleEditProduct,
    handleSaveProduct,
    handleCancelEdit,
    handleDeleteProduct
  } = useProductOperations(MOCK_PRODUCTS);
  
  // Search functionality
  const {
    searchQuery,
    setSearchQuery,
    filteredProducts,
    handleSearch
  } = useProductSearch(products);
  
  // Pagination
  const {
    currentPage,
    totalPages,
    currentProducts,
    handlePageChange,
    resetPagination
  } = useProductsPagination({ 
    filteredProducts,
    productsPerPage: 8 // 2 rows of 4 products
  });
  
  // Override handleSearch to reset pagination when searching
  const handleProductSearch = (e: React.FormEvent) => {
    handleSearch(e);
    resetPagination();
  };

  return {
    // Search
    searchQuery,
    setSearchQuery,
    filteredProducts: currentProducts,
    handleSearch: handleProductSearch,
    
    // Dialogs
    isEditDialogOpen,
    setIsEditDialogOpen,
    isAddDialogOpen,
    setIsAddDialogOpen,
    selectedProduct,
    
    // Pagination
    currentPage,
    totalPages,
    handlePageChange,
    
    // Product operations
    handleAddProduct,
    handleEditProduct,
    handleSaveProduct,
    handleCancelEdit,
    handleDeleteProduct
  };
}
