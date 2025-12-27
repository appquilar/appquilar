// src/application/hooks/useProducts.ts

import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { compositionRoot } from "@/compositionRoot";
import { useAuth } from "@/context/AuthContext";

import type { SearchProductsFilters } from "@/domain/repositories/ProductRepository";
import type { PublicProductHit } from "@/domain/models/PublicProductHit";
import type { ProductFormData } from "@/domain/models/Product";
import type { OwnerProductsResult } from "@/domain/repositories/ProductRepository";

const productService = compositionRoot.productService;

/**
 * ✅ Dashboard list item = formulario + id (tu BE ya incluye id)
 */
export type DashboardProductListItem = ProductFormData & { id: string };

export type DashboardProductsResult = {
    data: DashboardProductListItem[];
    total: number;
    page: number;
};

/**
 * ✅ PÚBLICO: /api/products/search (hits)
 */
export type SearchPublicProductsResult = {
    data: PublicProductHit[];
    total: number;
    page: number;
};

/**
 * ✅ DASHBOARD (privado): GET /api/users/{ownerId}/products?page&per_page
 */
export function useDashboardProducts(params: { page: number; perPage: number }) {
    const { currentUser } = useAuth();
    const ownerId = currentUser?.id ?? null;

    return useQuery<DashboardProductsResult>({
        queryKey: ["products", "dashboard", ownerId, params.page, params.perPage],
        enabled: !!ownerId,
        queryFn: async () => {
            const result: OwnerProductsResult = await productService.listByOwner(ownerId!, params.page, params.perPage);

            // OwnerProductsResult.data es ProductFormData[].
            // En dashboard lo tratamos como “list item” (ya trae todo lo que pintas).
            return {
                data: (result.data ?? []) as DashboardProductListItem[],
                total: result.total ?? 0,
                page: result.page ?? params.page,
            };
        },
        placeholderData: keepPreviousData,
    });
}

/**
 * ✅ COMPAT: hay componentes que importan `useProducts(filters)`
 */
export function useProducts(filters: SearchProductsFilters) {
    return useDashboardProducts({
        page: filters.page ?? 1,
        perPage: filters.perPage ?? 10,
    });
}

/**
 * ✅ PÚBLICO: /api/products/search (hits)
 */
export function usePublicProductsSearch(filters: SearchProductsFilters) {
    return useQuery<SearchPublicProductsResult>({
        queryKey: ["products", "public-search", filters],
        queryFn: async () => {
            return (await productService.search(filters)) as SearchPublicProductsResult;
        },
        placeholderData: keepPreviousData,
    });
}

/**
 * ✅ PÚBLICO: /api/products/{slug}
 */
export function useProductBySlug(slug: string | null) {
    return useQuery<ProductFormData>({
        queryKey: ["products", "bySlug", slug],
        queryFn: () => productService.getBySlug(slug!),
        enabled: !!slug,
    });
}

/**
 * ✅ PRIVADO: /api/products/{id} (dashboard)
 */
export function useProductById(productId: string | null) {
    return useQuery<ProductFormData>({
        queryKey: ["products", "byId", productId],
        queryFn: () => productService.getById(productId!),
        enabled: !!productId,
    });
}

/**
 * ✅ Mutaciones CRUD privadas (dashboard)
 */
export function useCreateProduct() {
    return useMutation({
        mutationFn: (payload: ProductFormData & { id: string }) => productService.create(payload),
    });
}

export function useUpdateProduct(productId: string) {
    return useMutation({
        mutationFn: (payload: ProductFormData) => productService.update(productId, payload),
    });
}

export function usePublishProduct() {
    return useMutation({
        mutationFn: (productId: string) => productService.publish(productId),
    });
}

export function useUnpublishProduct() {
    return useMutation({
        mutationFn: (productId: string) => productService.unpublish(productId),
    });
}

export function useArchiveProduct() {
    return useMutation({
        mutationFn: (productId: string) => productService.archive(productId),
    });
}
