// src/components/dashboard/ProductsManagement.tsx

import { useNavigate } from "react-router-dom";

import ProductGrid from "@/components/dashboard/products/ProductGrid";
import SearchToolbar from "@/components/dashboard/products/SearchToolbar";
import ProductsHeader from "@/components/dashboard/products/ProductsHeader";
import ProductPagination from "@/components/dashboard/products/ProductPagination";
import DeleteConfirmationModal from "@/components/dashboard/products/DeleteConfirmationModal";

import { useProductsManagement } from "@/components/dashboard/products/hooks/useProductsManagement";

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
        productToDeleteId,
        productToDeleteName,
        openDeleteModal,
        closeDeleteModal,
        confirmDeleteProduct,
        handleEditProduct,
    } = useProductsManagement();

    const handleAddProduct = () => {
        navigate("/dashboard/products/new");
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 rounded-md bg-destructive/10 text-destructive">
                {String(error)}
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <ProductsHeader />

            <SearchToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddProduct={handleAddProduct}
                onSearch={handleSearch}
            />

            <ProductGrid
                products={filteredProducts}
                onEdit={handleEditProduct}
                onDelete={openDeleteModal}
                onAdd={handleAddProduct}
            />

            <ProductPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />

            {productToDeleteId && (
                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={closeDeleteModal}
                    onConfirm={confirmDeleteProduct}
                    productName={productToDeleteName}
                />
            )}
        </div>
    );
};

export default ProductsManagement;
