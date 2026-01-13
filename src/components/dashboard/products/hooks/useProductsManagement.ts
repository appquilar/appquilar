import { useCallback, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useDashboardProducts } from "@/application/hooks/useProducts";
import type { ProductFilters } from "@/domain/repositories/ProductRepository";

type UseProductsManagementOptions = {
    initialPage?: number;
    perPage?: number;
};

export function useProductsManagement(options: UseProductsManagementOptions = {}) {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { initialPage = 1, perPage = 10 } = options;

    const [filters, setFilters] = useState<ProductFilters>({});
    const [currentPage, setCurrentPage] = useState(initialPage);

    // Delete modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDeleteId, setProductToDeleteId] = useState<string | null>(null);
    const [productToDeleteName, setProductToDeleteName] = useState<string>("");

    // Determine owner ID and Type
    const ownerId = currentUser?.companyId || currentUser?.id;
    const ownerType = currentUser?.companyId ? 'company' : 'user';

    // Debounce logic could be added here if needed, but for now passing filters directly
    const query = useDashboardProducts({
        page: currentPage,
        perPage,
        ownerId,
        ownerType,
        filters
    });

    const products = query.data?.data ?? [];
    const total = query.data?.total ?? 0;

    const totalPages = useMemo(() => {
        if (!perPage) return 1;
        return Math.max(1, Math.ceil(total / perPage));
    }, [total, perPage]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handleFilterChange = useCallback((newFilters: ProductFilters) => {
        setFilters(newFilters);
        setCurrentPage(1); // Reset to first page on filter change
    }, []);

    // Helper for legacy SearchToolbar compatibility if needed
    const handleSearch = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        // Triggered by form submit in toolbar, no-op if filters handled via onChange
    }, []);

    const handleEditProduct = useCallback(
        (productId: string) => {
            navigate(`/dashboard/products/${productId}`);
        },
        [navigate]
    );

    const openDeleteModal = useCallback((productId: string, productName: string) => {
        setProductToDeleteId(productId);
        setProductToDeleteName(productName);
        setIsDeleteModalOpen(true);
    }, []);

    const closeDeleteModal = useCallback(() => {
        setIsDeleteModalOpen(false);
        setProductToDeleteId(null);
        setProductToDeleteName("");
    }, []);

    const confirmDeleteProduct = useCallback(async () => {
        if (!productToDeleteId) return;
        closeDeleteModal();
        await query.refetch();
    }, [productToDeleteId, closeDeleteModal, query]);

    return {
        // Expose filters instead of simple searchQuery
        filters,
        handleFilterChange,

        // Compatibility props for existing UI if it wasn't fully updated yet
        searchQuery: filters.name || '',
        setSearchQuery: (val: string) => handleFilterChange({...filters, name: val}),

        filteredProducts: products, // Products are already filtered by server
        currentPage,
        totalPages,

        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: (query.error as any)?.message ?? null,

        handlePageChange,
        handleSearch,
        handleEditProduct,

        isDeleteModalOpen,
        productToDeleteId,
        productToDeleteName,
        openDeleteModal,
        closeDeleteModal,
        confirmDeleteProduct,
    };
}