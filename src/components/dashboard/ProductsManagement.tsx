
import React from 'react';

// Import refactored components
import ProductGrid from './products/ProductGrid';
import SearchToolbar from './products/SearchToolbar';
import ProductEditDialog from './products/ProductEditDialog';
import ProductsHeader from './products/ProductsHeader';
import { useProductsManagement } from './products/hooks/useProductsManagement';

const ProductsManagement = () => {
  const {
    searchQuery,
    setSearchQuery,
    filteredProducts,
    isEditDialogOpen,
    setIsEditDialogOpen,
    selectedProduct,
    handleSearch,
    handleAddProduct,
    handleEditProduct,
    handleSaveProduct,
    handleCancelEdit,
    handleDeleteProduct
  } = useProductsManagement();
  
  return (
    <div className="space-y-6">
      <ProductsHeader />
      
      {/* Barra de búsqueda y filtros */}
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
      
      {/* Diálogo de edición de producto */}
      <ProductEditDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        selectedProduct={selectedProduct}
        onSave={handleSaveProduct}
        onCancel={handleCancelEdit}
      />
    </div>
  );
};

export default ProductsManagement;
