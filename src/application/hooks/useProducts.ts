import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Product, ProductFormData } from '@/domain/models/Product';
import { productService } from '@/compositionRoot';
import { toast } from 'sonner';
import { ProductFilters } from '@/domain/repositories/ProductRepository';

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

export const useOwnedProductsCount = ({
    ownerId,
    ownerType = 'company',
    filters,
}: UseOwnedProductsCountParams) => {
    return useQuery({
        queryKey: ['products', 'owned-count', ownerId, ownerType, filters],
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
        enabled: Boolean(ownerId),
        placeholderData: (previousData) => previousData,
    });
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
            toast.success('Producto creado correctamente');
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (error) => {
            console.error('Error creating product:', error);
            toast.error('Error al crear el producto');
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
            toast.success('Producto actualizado correctamente');
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product', data.id] });
        },
        onError: (error) => {
            console.error('Error updating product:', error);
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
            toast.success('Producto archivado correctamente');
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (error) => {
            console.error('Error deleting product:', error);
            toast.error('Error al archivar el producto');
        }
    });
};

export const usePublishProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => productService.publishProduct(id),
        onSuccess: (published) => {
            if (published) {
                toast.success('Producto publicado correctamente');
                queryClient.invalidateQueries({ queryKey: ['products'] });
                return;
            }

            toast.error('No se pudo publicar el producto');
        },
        onError: (error) => {
            console.error('Error publishing product:', error);
            toast.error('Error al publicar el producto');
        }
    });
};

export const useCalculateRentalCost = () => {
    return useMutation({
        mutationFn: ({
            productId,
            startDate,
            endDate,
        }: {
            productId: string;
            startDate: string;
            endDate: string;
        }) => productService.calculateRentalCost(productId, startDate, endDate),
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
