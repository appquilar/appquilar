// src/application/hooks/useProductById.ts

import { useQuery } from "@tanstack/react-query";
import { compositionRoot } from "@/compositionRoot";
import type { ProductFormData } from "@/domain/models/Product";

const productService = compositionRoot.productService;

/**
 * Obtiene un producto por su ID (uso privado: dashboard / edición)
 * GET /api/products/{product_id}
 */
export function useProductById(productId: string | null) {
    return useQuery<ProductFormData>({
        queryKey: ["product", "byId", productId],
        enabled: !!productId,
        queryFn: () => productService.getById(productId!),
    });
}
