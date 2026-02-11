import { useQuery } from "@tanstack/react-query";
import { compositionRoot } from "@/compositionRoot";
import type { Product } from "@/domain/models/Product";

type PublicSearchResult = {
    products: Product[];
    total: number;
    page: number;
};

type SearchGeoFilters = {
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
};

export const usePublicProductSearch = (text: string) => {
    return usePublicProductSearchWithCategories(text, [], {});
};

export const usePublicProductSearchWithCategories = (
    text: string,
    categoryIds: string[],
    geoFilters: SearchGeoFilters
) => {
    const trimmedText = text.trim();
    const normalizedCategories = [...categoryIds].sort();
    const latitude = geoFilters.latitude;
    const longitude = geoFilters.longitude;
    const radiusKm = geoFilters.radiusKm;

    return useQuery<PublicSearchResult>({
        queryKey: [
            "products",
            "public-search",
            trimmedText,
            normalizedCategories,
            latitude,
            longitude,
            radiusKm,
        ],
        enabled: true,
        placeholderData: (previousData) => previousData,
        queryFn: async () => {
            const result = await compositionRoot.productService.search({
                text: trimmedText.length > 0 ? trimmedText : undefined,
                categories: normalizedCategories.length > 0 ? normalizedCategories : undefined,
                latitude,
                longitude,
                radius: radiusKm,
                page: 1,
                per_page: 50,
            });

            return {
                products: result.data,
                total: result.total,
                page: result.page,
            };
        },
    });
};
