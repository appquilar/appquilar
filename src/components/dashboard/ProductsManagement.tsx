
import { useNavigate } from 'react-router-dom';
import ProductGrid from './products/ProductGrid';
import SearchToolbar from './products/SearchToolbar';
import ProductsHeader from './products/ProductsHeader';
import ProductPagination from './products/ProductPagination';
import DeleteConfirmationModal from './products/DeleteConfirmationModal';
import { useProductsManagement } from './products/hooks/useProductsManagement';

const ProductsManagement = () => {
  const navigate = useNavigate();
  const {
    searchQuery,
    setSearchQuery,
    filteredProducts,
    currentPage,
    totalPages,
    isLoading,
    error,
    handlePageChange,
    handleSearch,
    isDeleteModalOpen,
    productToDelete,
    openDeleteModal,
    closeDeleteModal,
    confirmDeleteProduct
  } = useProductsManagement();
  
  const handleAddProduct = () => {
    navigate('/dashboard/products/new');
  };

  const handleEditProduct = (productId: string) => {
    navigate(`/dashboard/products/edit/${productId}`);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-md bg-destructive/10 text-destructive">
        {error}
      </div>
    );
  }
  
  return (
    <div className="space-y-6 p-6">
      <ProductsHeader />
      
      {/* Barra de búsqueda */}
      <SearchToolbar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddProduct={handleAddProduct}
        onSearch={handleSearch}
      />
      
      {/* Cuadrícula de productos */}
      <ProductGrid 
        products={filteredProducts}
        onEdit={handleEditProduct}
        onDelete={openDeleteModal}
        onAdd={handleAddProduct}
      />
      
      {/* Paginación */}
      <ProductPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Modal de confirmación de eliminación */}
      {productToDelete && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDeleteProduct}
          productName={productToDelete.name}
        />
      )}
    </div>
  );
};

export default ProductsManagement;
