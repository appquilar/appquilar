// src/components/dashboard/products/hooks/useProductsManagement.ts

import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useDashboardProducts } from "@/application/hooks/useProducts";
import type { ProductFormData } from "@/domain/models/Product";

type UseProductsManagementOptions = {
    initialPage?: number;
    perPage?: number;
};

export function useProductsManagement(options: UseProductsManagementOptions = {}) {
    const navigate = useNavigate();
    const { initialPage = 1, perPage = 10 } = options;

    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(initialPage);

    // Delete modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDeleteId, setProductToDeleteId] = useState<string | null>(null);
    const [productToDeleteName, setProductToDeleteName] = useState<string>("");

    const query = useDashboardProducts({ page: currentPage, perPage });
    const products = query.data?.data ?? [];
    const total = query.data?.total ?? 0;

    const filteredProducts = useMemo(() => {
        if (!searchQuery) return products;

        const q = searchQuery.toLowerCase();
        return products.filter((p: ProductFormData & { id: string }) => {
            const name = (p.name ?? "").toLowerCase();
            const desc = (p.description ?? "").toLowerCase();
            const internalId = ((p as any).internalId ?? "").toLowerCase();
            return name.includes(q) || desc.includes(q) || internalId.includes(q);
        });
    }, [products, searchQuery]);

    const totalPages = useMemo(() => {
        if (!perPage) return 1;
        return Math.max(1, Math.ceil(total / perPage));
    }, [total, perPage]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handleSearch = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
    }, []);

    const handleEditProduct = useCallback(
        (productId: string) => {
            // ✅ tu routing real: /dashboard/products/:productId
            navigate(`/dashboard/products/${productId}`);
        },
        [navigate]
    );

    // ✅ Ahora openDeleteModal recibe productId y name (coherente con ProductCard)
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

        // 🔥 Endpoint DELETE aún no implementado en tu código compartido.
        // De momento: cerramos y refrescamos.
        closeDeleteModal();
        await query.refetch();
    }, [productToDeleteId, closeDeleteModal, query]);

    return {
        searchQuery,
        setSearchQuery,

        filteredProducts,
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
