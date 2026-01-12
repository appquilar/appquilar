import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Product, ProductFormData } from '@/domain/models/Product';
import { productService } from '@/compositionRoot';
import { toast } from 'sonner';

interface UseDashboardProductsParams {
    page?: number;
    perPage?: number;
    ownerId?: string | null;
    ownerType?: 'company' | 'user';
}

/**
 * Hook for the Product Dashboard List (Pagination + Search + Owner Filter)
 */
export const useDashboardProducts = ({
                                         page = 1,
                                         perPage = 10,
                                         ownerId,
                                         ownerType = 'company'
                                     }: UseDashboardProductsParams) => {
    return useQuery({
        queryKey: ['products', 'dashboard', ownerId, ownerType, page, perPage],
        queryFn: async () => {
            // If we have an owner ID, we list THEIR products specifically
            if (ownerId) {
                return await productService.listByOwnerPaginated(ownerId, ownerType, page, perPage);
            }

            // Fallback to global search/list if no owner specified (e.g. admin view)
            return await productService.search({ page, per_page: perPage });
        },
        // Only run query if we have the owner info (if required) or just let it run
        enabled: true,
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
            toast.success('Producto eliminado correctamente');
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (error) => {
            console.error('Error deleting product:', error);
            toast.error('Error al eliminar el producto');
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