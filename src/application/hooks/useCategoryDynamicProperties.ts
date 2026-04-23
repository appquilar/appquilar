import { useQuery } from "@tanstack/react-query";
import { compositionRoot } from "@/compositionRoot";

export const useCategoryDynamicProperties = (categoryIds: string[]) => {
    const normalizedCategoryIds = [...categoryIds].filter(Boolean).sort();

    return useQuery({
        queryKey: ["categories", "dynamic-properties", normalizedCategoryIds],
        queryFn: () => compositionRoot.categoryService.getDynamicProperties(normalizedCategoryIds),
        enabled: normalizedCategoryIds.length > 0,
        placeholderData: (previousData) => previousData,
    });
};
