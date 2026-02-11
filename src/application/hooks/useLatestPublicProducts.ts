import { useQuery } from "@tanstack/react-query";
import { compositionRoot } from "@/compositionRoot";
import type { Product } from "@/domain/models/Product";

export const useLatestPublicProducts = () => {
    return useQuery<Product[]>({
        queryKey: ["products", "latest-public"],
        queryFn: async () => {
            const result = await compositionRoot.productService.search({
                page: 1,
                per_page: 6,
            });

            return result.data;
        },
    });
};
