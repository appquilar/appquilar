
import React from 'react';
import { useNavigate } from 'react-router-dom';

// Import refactored components
import ProductGrid from './products/ProductGrid';
import SearchToolbar from './products/SearchToolbar';
import ProductsHeader from './products/ProductsHeader';
import ProductPagination from './products/ProductPagination';
import { useProductsManagement } from './products/hooks/useProductsManagement';

const ProductsManagement = () => {
  const navigate = useNavigate();
  const {
    searchQuery,
    setSearchQuery,
    filteredProducts,
    currentPage,
    totalPages,
    handlePageChange,
    handleSearch,
    handleDeleteProduct
  } = useProductsManagement();
  
  const handleAddProduct = () => {
    navigate('/dashboard/products/new');
  };

  const handleEditProduct = (productId: string) => {
    navigate(`/dashboard/products/edit/${productId}`);
  };
  
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
        onDelete={handleDeleteProduct}
        onAdd={handleAddProduct}
      />
      
      {/* Paginación */}
      <ProductPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default ProductsManagement;
