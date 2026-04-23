import { useQuery } from "@tanstack/react-query";
import { compositionRoot } from "@/compositionRoot";
import type { Product } from "@/domain/models/Product";
import type { AvailableDynamicFilter } from "@/domain/models/DynamicProperty";

type PublicSearchResult = {
    products: Product[];
    total: number;
    page: number;
    availableDynamicFilters: AvailableDynamicFilter[];
};

type SearchGeoFilters = {
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
};

type DynamicSearchFilters = {
    propertyValues?: Record<string, string[]>;
    propertyRanges?: Record<string, { min?: number; max?: number }>;
};

export const usePublicProductSearch = (text: string) => {
    return usePublicProductSearchWithCategories(text, [], {}, {});
};

export const usePublicProductSearchWithCategories = (
    text: string,
    categoryIds: string[],
    geoFilters: SearchGeoFilters,
    dynamicFilters: DynamicSearchFilters
) => {
    const trimmedText = text.trim();
    const normalizedCategories = [...categoryIds].sort();
    const latitude = geoFilters.latitude;
    const longitude = geoFilters.longitude;
    const radiusKm = geoFilters.radiusKm;
    const propertyValueEntries = Object.entries(
        dynamicFilters.propertyValues ?? {}
    ) as Array<[string, string[]]>;
    const normalizedPropertyValues = Object.fromEntries(
        propertyValueEntries
            .map(([code, values]): [string, string[]] => [code, [...values].sort()])
            .sort(([left], [right]) => left.localeCompare(right))
    );
    const normalizedPropertyRanges = Object.fromEntries(
        Object.entries(dynamicFilters.propertyRanges ?? {})
            .sort(([left], [right]) => left.localeCompare(right))
    );

    return useQuery<PublicSearchResult>({
        queryKey: [
            "products",
            "public-search",
            trimmedText,
            normalizedCategories,
            latitude,
            longitude,
            radiusKm,
            normalizedPropertyValues,
            normalizedPropertyRanges,
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
                property_values: Object.keys(normalizedPropertyValues).length > 0 ? normalizedPropertyValues : undefined,
                property_ranges: Object.keys(normalizedPropertyRanges).length > 0 ? normalizedPropertyRanges : undefined,
                page: 1,
                per_page: 50,
            });

            return {
                products: result.data,
                total: result.total,
                page: result.page,
                availableDynamicFilters: result.availableDynamicFilters ?? [],
            };
        },
    });
};
