import { useCallback, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useDashboardProducts, useDeleteProduct, usePublishProduct, useActiveProductsCount } from "@/application/hooks/useProducts";
import { useCreateCheckoutSession, useCreateCustomerPortalSession } from "@/application/hooks/useBilling";
import type { ProductFilters } from "@/domain/repositories/ProductRepository";
import { getCompanyPlanProductLimit, getUserPlanProductLimit } from "@/domain/models/Subscription";
import { toast } from "sonner";
import { ApiError } from "@/infrastructure/http/ApiClient";
import type { CompanyUserRoleType } from "@/domain/models/Subscription";

type UseProductsManagementOptions = {
    initialPage?: number;
    perPage?: number;
};

type PublicationLimitCta =
    | {
        label: "Hazte Pro";
        action: "upgrade_user_pro";
    }
    | {
        label: "Hazte empresa";
        action: "upgrade_to_company";
    }
    | {
        label: "Hazte Pro";
        action: "upgrade_company";
    }
    | {
        label: "Hazte Enterprise";
        action: "upgrade_company";
    };

export function useProductsManagement(options: UseProductsManagementOptions = {}) {
    const navigate = useNavigate();
    const { currentUser, isLoading: isAuthLoading } = useAuth();
    const { initialPage = 1, perPage = 10 } = options;

    const [filters, setFilters] = useState<ProductFilters>({});
    const [currentPage, setCurrentPage] = useState(initialPage);

    // Delete modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDeleteId, setProductToDeleteId] = useState<string | null>(null);
    const [productToDeleteName, setProductToDeleteName] = useState<string>("");

    // Determine owner ID and Type
    const normalizedUser = currentUser as (typeof currentUser & {
        company_id?: string | null;
        user_id?: string;
    }) | null;
    const companyId = normalizedUser?.companyId ?? normalizedUser?.company_id ?? null;
    const userId = normalizedUser?.id ?? normalizedUser?.user_id ?? null;
    const ownerId = companyId ?? userId;
    const ownerType = companyId ? 'company' : 'user';

    // Debounce logic could be added here if needed, but for now passing filters directly
    const query = useDashboardProducts({
        page: currentPage,
        perPage,
        ownerId,
        ownerType,
        filters,
        enabled: !isAuthLoading,
    });
    const deleteProductMutation = useDeleteProduct();
    const publishProductMutation = usePublishProduct();
    const createCheckoutMutation = useCreateCheckoutSession();
    const createPortalMutation = useCreateCustomerPortalSession();

    const slotLimit = useMemo(() => {
        if (companyId) {
            return getCompanyPlanProductLimit(normalizedUser?.companyContext ?? null);
        }

        return getUserPlanProductLimit(normalizedUser?.planType ?? "explorer");
    }, [companyId, normalizedUser?.companyContext, normalizedUser?.planType]);

    const activeProductsCountQuery = useActiveProductsCount({
        ownerId,
        ownerType,
    });

    const hasReachedProductPublicationLimit = useMemo(() => {
        if (slotLimit == null) {
            return false;
        }

        const activeProducts = activeProductsCountQuery.data ?? 0;
        return activeProducts >= slotLimit;
    }, [activeProductsCountQuery.data, slotLimit]);

    const companyRole =
        (normalizedUser?.companyContext?.companyRole ?? normalizedUser?.companyRole ?? null) as CompanyUserRoleType | null;
    const isCompanyAdmin = companyRole === "ROLE_ADMIN";
    const publicationLimitCta = useMemo<PublicationLimitCta | null>(() => {
        if (!hasReachedProductPublicationLimit) {
            return null;
        }

        if (!companyId) {
            if (normalizedUser?.planType === "user_pro") {
                return {
                    label: "Hazte empresa",
                    action: "upgrade_to_company",
                };
            }

            return {
                label: "Hazte Pro",
                action: "upgrade_user_pro",
            };
        }

        const companyPlan = normalizedUser?.companyContext?.planType ?? null;
        if (!isCompanyAdmin) {
            return null;
        }

        if (companyPlan === "starter") {
            return {
                label: "Hazte Pro",
                action: "upgrade_company",
            };
        }

        if (companyPlan === "pro") {
            return {
                label: "Hazte Enterprise",
                action: "upgrade_company",
            };
        }

        return null;
    }, [
        companyId,
        hasReachedProductPublicationLimit,
        isCompanyAdmin,
        normalizedUser?.companyContext?.planType,
        normalizedUser?.planType,
    ]);

    const products = query.data?.data ?? [];
    const total = query.data?.total ?? 0;
    const errorMessage = query.error instanceof Error ? query.error.message : null;

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
        await deleteProductMutation.mutateAsync(productToDeleteId);
        closeDeleteModal();
        await query.refetch();
    }, [productToDeleteId, closeDeleteModal, query, deleteProductMutation]);

    const handlePublishProduct = useCallback(async (productId: string) => {
        await publishProductMutation.mutateAsync(productId);
        await query.refetch();
    }, [publishProductMutation, query]);

    const handlePublicationLimitCta = useCallback(async () => {
        if (!publicationLimitCta) {
            return;
        }

        if (publicationLimitCta.action === "upgrade_to_company") {
            navigate("/dashboard/upgrade");
            return;
        }

        const currentUrl = typeof window !== "undefined" ? window.location.href : "/dashboard/products";

        try {
            if (publicationLimitCta.action === "upgrade_user_pro") {
                const checkoutSession = await createCheckoutMutation.mutateAsync({
                    scope: "user",
                    planType: "user_pro",
                    successUrl: currentUrl,
                    cancelUrl: currentUrl,
                });

                window.location.assign(checkoutSession.url);
                return;
            }

            const newTab = window.open("", "_blank");
            if (!newTab) {
                toast.error("No se pudo abrir una nueva pestana. Revisa el bloqueador de ventanas emergentes.");
                return;
            }
            newTab.opener = null;

            try {
                const portalSession = await createPortalMutation.mutateAsync({
                    scope: "company",
                    returnUrl: currentUrl,
                });

                newTab.location.href = portalSession.url;
            } catch (error) {
                newTab.close();
                throw error;
            }
        } catch (error) {
            const backendError = extractBackendErrorMessage(error);
            toast.error(
                backendError ?? "No se pudo iniciar el proceso de mejora del plan."
            );
        }
    }, [createCheckoutMutation, createPortalMutation, navigate, publicationLimitCta]);

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
        error: errorMessage,

        handlePageChange,
        handleSearch,
        handleEditProduct,
        handlePublishProduct,
        publicationLimitCtaLabel: publicationLimitCta?.label ?? null,
        hasReachedProductPublicationLimit,
        handlePublicationLimitCta,
        isProcessingPublicationLimitCta: createCheckoutMutation.isPending || createPortalMutation.isPending,

        isDeleteModalOpen,
        productToDeleteId,
        productToDeleteName,
        openDeleteModal,
        closeDeleteModal,
        confirmDeleteProduct,
    };
}

const extractBackendErrorMessage = (error: unknown): string | null => {
    if (!(error instanceof ApiError)) {
        return null;
    }

    const payload = error.payload as { error?: unknown } | undefined;
    const backendError = payload?.error;

    if (Array.isArray(backendError) && typeof backendError[0] === "string") {
        return backendError[0];
    }

    if (typeof backendError === "string") {
        return backendError;
    }

    return null;
};
