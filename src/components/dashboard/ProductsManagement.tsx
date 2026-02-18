import { useNavigate } from "react-router-dom";

import ProductGrid from "@/components/dashboard/products/ProductGrid";
import SearchToolbar from "@/components/dashboard/products/SearchToolbar";
import ProductsHeader from "@/components/dashboard/products/ProductsHeader";
import ProductPagination from "@/components/dashboard/products/ProductPagination";
import DeleteConfirmationModal from "@/components/dashboard/products/DeleteConfirmationModal";

import { useProductsManagement } from "@/components/dashboard/products/hooks/useProductsManagement";
import { useAuth } from "@/context/AuthContext";
import { hasMinimalAddress } from "@/domain/models/Address";
import { toast } from "sonner";

const ProductsManagement = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const canCreateProduct = hasMinimalAddress(currentUser?.address);

    const {
        filters,
        handleFilterChange,
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
        handlePublishProduct,
        publicationLimitCtaLabel,
        hasReachedProductPublicationLimit,
        handlePublicationLimitCta,
        isProcessingPublicationLimitCta,
    } = useProductsManagement();

    const handleAddProduct = () => {
        if (!canCreateProduct) {
            toast.error("Debes añadir una dirección en tu perfil antes de crear productos.");
            return;
        }

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
        <div className="space-y-6">
            <ProductsHeader />

            <SearchToolbar
                filters={filters}
                onFilterChange={handleFilterChange}
                onAddProduct={handleAddProduct}
                onSearch={handleSearch}
                isAddDisabled={!canCreateProduct}
            />

            <ProductGrid
                products={filteredProducts}
                onEdit={handleEditProduct}
                onPublish={handlePublishProduct}
                publicationLimitCtaLabel={publicationLimitCtaLabel}
                isPublicationLimitReached={hasReachedProductPublicationLimit}
                onPublicationLimitCta={handlePublicationLimitCta}
                isProcessingPublicationLimitCta={isProcessingPublicationLimitCta}
                onDelete={openDeleteModal}
                onAdd={handleAddProduct}
                isAddDisabled={!canCreateProduct}
                shouldShowMissingAddressMessage={!canCreateProduct}
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
