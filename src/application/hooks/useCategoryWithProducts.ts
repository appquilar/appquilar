import { useQuery } from "@tanstack/react-query";
import { compositionRoot } from "@/compositionRoot";
import type { Category } from "@/domain/models/Category";
import type { Product as DomainProduct } from "@/domain/models/Product";

type CategoryWithProducts = {
    category: Category;
    products: DomainProduct[];
};

type SearchGeoFilters = {
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
};

export const useCategoryWithProducts = (slug: string | undefined) => {
    return useCategoryWithProductsByText(slug, "", {});
};

export const useCategoryWithProductsByText = (
    slug: string | undefined,
    text: string,
    geoFilters: SearchGeoFilters
) => {
    const trimmedText = text.trim();
    const latitude = geoFilters.latitude;
    const longitude = geoFilters.longitude;
    const radiusKm = geoFilters.radiusKm;

    return useQuery<CategoryWithProducts>({
        queryKey: [
            "category",
            "public",
            slug,
            trimmedText,
            latitude,
            longitude,
            radiusKm,
        ],
        enabled: Boolean(slug),
        placeholderData: (previousData) => previousData,
        queryFn: async () => {
            const category = await compositionRoot.categoryService.getBySlug(slug!);
            const searchResult = await compositionRoot.productService.search({
                text: trimmedText.length > 0 ? trimmedText : undefined,
                categories: [category.id],
                latitude,
                longitude,
                radius: radiusKm,
                page: 1,
                per_page: 50,
            });

            return {
                category,
                products: searchResult.data,
            };
        },
    });
};
