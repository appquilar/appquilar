import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Product, ProductFormData } from '@/domain/models/Product';
import { productService } from '@/compositionRoot';
import { toast } from 'sonner';
import { ProductFilters, ProductOwnerSummary } from '@/domain/repositories/ProductRepository';
import { ApiError } from '@/infrastructure/http/ApiClient';
import { extractBackendErrorCode, extractBackendErrorMessage, getErrorMessage } from '@/utils/backendError';

interface UseDashboardProductsParams {
    page?: number;
    perPage?: number;
    ownerId?: string | null;
    ownerType?: 'company' | 'user';
    filters?: ProductFilters;
    enabled?: boolean;
}

interface UseOwnedProductsCountParams {
    ownerId?: string | null;
    ownerType?: 'company' | 'user';
    filters?: ProductFilters;
}

interface UseActiveProductsCountParams {
    ownerId?: string | null;
    ownerType?: 'company' | 'user';
}

interface UseOwnerProductSummaryParams {
    ownerId?: string | null;
    ownerType?: 'company' | 'user';
    enabled?: boolean;
}

const EMPTY_OWNER_PRODUCT_SUMMARY: ProductOwnerSummary = {
    total: 0,
    draft: 0,
    published: 0,
    archived: 0,
    active: 0,
};

const isMachineReadableBackendCode = (value: string): boolean => /^[a-z0-9_.-]+$/i.test(value);

const getProductPlanLimitErrorMessage = (error: unknown): string | null => {
    const backendCode = extractBackendErrorCode(error);

    if (backendCode === 'subscription.user.product_limit_reached') {
        return 'Has alcanzado el limite de productos publicados de tu plan. Puedes seguir guardando borradores, pero para publicar otro producto necesitas liberar uno ya publicado o mejorar tu plan.';
    }

    if (backendCode === 'subscription.company.product_limit_reached') {
        return 'Tu empresa ha alcanzado el limite de productos publicados del plan actual. Puedes seguir guardando borradores, pero para publicar otro producto necesitas despublicar uno existente o mejorar el plan.';
    }

    return null;
};

const getProductMutationErrorMessage = (error: unknown, fallback: string): string => {
    const productPlanLimitMessage = getProductPlanLimitErrorMessage(error);
    if (productPlanLimitMessage) {
        return productPlanLimitMessage;
    }

    const backendMessage = extractBackendErrorMessage(error);
    if (backendMessage && !isMachineReadableBackendCode(backendMessage)) {
        return backendMessage;
    }

    return fallback;
};

const getProductPublishAfterSaveErrorMessage = (error: unknown): string => {
    const backendCode = extractBackendErrorCode(error);

    if (backendCode === 'subscription.user.product_limit_reached') {
        return 'Has alcanzado el limite de productos publicados de tu plan. Los cambios se han guardado, pero el producto sigue en borrador hasta que liberes uno ya publicado o mejores tu plan.';
    }

    if (backendCode === 'subscription.company.product_limit_reached') {
        return 'Tu empresa ha alcanzado el limite de productos publicados del plan actual. Los cambios se han guardado, pero el producto sigue en borrador hasta que despubliques uno existente o mejores el plan.';
    }

    return getProductMutationErrorMessage(
        error,
        'No se pudo publicar el producto. Revisa tu limite de productos publicados e intentalo de nuevo.'
    );
};

const canUseOwnerSummaryForFilters = (filters?: ProductFilters): boolean => {
    if (!filters) {
        return true;
    }

    return Object.keys(filters).every((key) => key === 'publicationStatus');
};

const countFromSummary = (
    summary: ProductOwnerSummary,
    filters?: ProductFilters
): number => {
    if (!filters?.publicationStatus) {
        return summary.total;
    }

    const publicationStatuses = Array.isArray(filters.publicationStatus)
        ? filters.publicationStatus
        : [filters.publicationStatus];

    return publicationStatuses.reduce((total, status) => {
        switch (status) {
            case 'draft':
                return total + summary.draft;
            case 'published':
                return total + summary.published;
            case 'archived':
                return total + summary.archived;
            default:
                return total;
        }
    }, 0);
};

/**
 * Hook for the Product Dashboard List (Pagination + Search + Owner Filter)
 */
export const useDashboardProducts = ({
                                         page = 1,
                                         perPage = 10,
                                         ownerId,
                                         ownerType = 'company',
                                         filters = {},
                                         enabled = true,
                                     }: UseDashboardProductsParams) => {
    return useQuery({
        // Add filters to query key so it refetches when they change
        queryKey: ['products', 'dashboard', ownerId, ownerType, page, perPage, filters],
        queryFn: async () => {
            if (!ownerId) {
                return {
                    data: [],
                    total: 0,
                    page,
                    perPage,
                };
            }

            return await productService.listByOwnerPaginated(ownerId, ownerType, page, perPage, filters);
        },
        enabled: enabled && Boolean(ownerId),
        placeholderData: (previousData) => previousData,
    });
};

export const useOwnerProductSummary = ({
    ownerId,
    ownerType = 'company',
    enabled = true,
}: UseOwnerProductSummaryParams) => {
    return useQuery({
        queryKey: ['products', 'owner-summary', ownerId, ownerType],
        queryFn: async () => {
            if (!ownerId) {
                return EMPTY_OWNER_PRODUCT_SUMMARY;
            }

            return productService.getOwnerSummary(ownerId, ownerType);
        },
        enabled: enabled && Boolean(ownerId),
        placeholderData: (previousData) => previousData,
    });
};

export const useOwnedProductsCount = ({
    ownerId,
    ownerType = 'company',
    filters,
}: UseOwnedProductsCountParams) => {
    const canUseSummary = canUseOwnerSummaryForFilters(filters);
    const ownerSummaryQuery = useOwnerProductSummary({
        ownerId,
        ownerType,
        enabled: canUseSummary,
    });
    const listCountQuery = useQuery({
        queryKey: ['products', 'owned-count-fallback', ownerId, ownerType, filters],
        queryFn: async () => {
            if (!ownerId) {
                return 0;
            }

            const response = await productService.listByOwnerPaginated(
                ownerId,
                ownerType,
                1,
                1,
                filters
            );

            return response.total ?? response.data.length;
        },
        enabled: Boolean(ownerId) && !canUseSummary,
        placeholderData: (previousData) => previousData,
    });

    if (canUseSummary) {
        return {
            ...ownerSummaryQuery,
            data: countFromSummary(ownerSummaryQuery.data ?? EMPTY_OWNER_PRODUCT_SUMMARY, filters),
        };
    }

    return listCountQuery;
};

export const useActiveProductsCount = ({
    ownerId,
    ownerType = 'company',
}: UseActiveProductsCountParams) => {
    const ownerSummaryQuery = useOwnerProductSummary({ ownerId, ownerType });

    return {
        ...ownerSummaryQuery,
        data: ownerSummaryQuery.data?.active ?? 0,
    };
};

/**
 * Hook to fetch a single product by ID
 */
export const useProduct = (id?: string) => {
    return useQuery({
        queryKey: ['product', id],
        queryFn: async () => {
            if (!id || id === 'new') return null;
            return await productService.getProductById(id);
        },
        enabled: !!id && id !== 'new',
    });
};

/**
 * Hook to fetch a single product by Slug
 */
export const useProductBySlug = (slug?: string) => {
    return useQuery({
        queryKey: ['product', 'slug', slug],
        queryFn: async () => {
            if (!slug) return null;
            return await productService.getBySlug(slug);
        },
        enabled: !!slug,
    });
};

/**
 * Hook to Create a Product
 */
export const useCreateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: ProductFormData) => productService.createProduct(data),
        onSuccess: () => {
            toast.success('Guardado correcto');
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (error) => {
            console.error('Error creating product:', error);
            if (error instanceof ApiError && error.payload?.errors) {
                return;
            }
            toast.error(
                getProductMutationErrorMessage(
                    error,
                    'No se pudo crear el producto. Intentalo de nuevo en unos minutos.'
                )
            );
        }
    });
};

/**
 * Hook to Update a Product
 */
export const useUpdateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: ProductFormData }) =>
            productService.updateProduct(id, data),
        onSuccess: (data) => {
            toast.success('Guardado correcto');
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product', data.id] });
            queryClient.invalidateQueries({ queryKey: ['product', 'slug', data.slug] });
            queryClient.invalidateQueries({ queryKey: ['productInventory', data.id] });
            queryClient.invalidateQueries({ queryKey: ['productInventory', data.id, 'allocations'] });
            queryClient.invalidateQueries({ queryKey: ['productInventory', data.id, 'units'] });
        },
        onError: (error, variables) => {
            console.error('Error updating product:', error);
            if (error instanceof ApiError && error.payload?.errors) {
                return;
            }

            if (variables.data.publicationStatus === 'published') {
                toast.error(getProductPublishAfterSaveErrorMessage(error));
                return;
            }

            toast.error('Error al actualizar el producto');
        }
    });
};

/**
 * Hook to Delete a Product
 */
export const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => productService.deleteProduct(id),
        onSuccess: () => {
            toast.success('Producto eliminado correctamente');
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (error) => {
            console.error('Error deleting product:', error);
            const backendCode = extractBackendErrorCode(error);
            if (backendCode === 'product.delete.has_rents') {
                toast.error('No puedes eliminar este producto porque ya tiene alquileres asociados.');
                return;
            }

            toast.error(getErrorMessage(error, 'Error al eliminar el producto'));
        }
    });
};

export const usePublishProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => productService.publishProduct(id),
        onSuccess: () => {
            toast.success('Producto publicado correctamente');
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (error) => {
            console.error('Error publishing product:', error);
            toast.error(
                getProductMutationErrorMessage(
                    error,
                    'No se pudo publicar el producto. Revisa tu limite de productos publicados e intentalo de nuevo.'
                )
            );
        }
    });
};

export const useCalculateRentalCost = () => {
    return useMutation({
        mutationFn: ({
            productId,
            startDate,
            endDate,
            quantity,
        }: {
            productId: string;
            startDate: string;
            endDate: string;
            quantity: number;
        }) => productService.calculateRentalCost(productId, startDate, endDate, quantity),
        onError: (error) => {
            console.error('Error calculating rental cost:', error);
            toast.error('No se pudo calcular el coste del alquiler');
        }
    });
};

/**
 * Legacy hook
 */
export const useProducts = (ownerId?: string) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { mutateAsync: createProduct } = useCreateProduct();
    const { mutateAsync: updateProduct } = useUpdateProduct();
    const { mutateAsync: deleteProduct } = useDeleteProduct();

    useEffect(() => {
        const loadProducts = async () => {
            setIsLoading(true);
            try {
                let items: Product[];
                if (ownerId) {
                    items = await productService.listByOwner(ownerId);
                } else {
                    items = await productService.getAllProducts();
                }
                setProducts(items);
            } catch (err) {
                console.error(err);
                setError('Error loading products');
            } finally {
                setIsLoading(false);
            }
        };
        loadProducts();
    }, [ownerId]);

    return {
        products,
        isLoading,
        error,
        createProduct,
        updateProduct: (id: string, data: ProductFormData) => updateProduct({ id, data }),
        deleteProduct,
        getProductById: productService.getProductById.bind(productService)
    };
};
