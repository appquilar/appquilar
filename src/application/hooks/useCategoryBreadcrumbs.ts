import { useQuery } from "@tanstack/react-query";

import { compositionRoot } from "@/compositionRoot";

export const useCategoryBreadcrumbs = (categoryId?: string | null) => {
    const normalizedCategoryId = categoryId?.trim() ?? "";

    return useQuery({
        queryKey: ["categories", "breadcrumbs", normalizedCategoryId],
        queryFn: () => compositionRoot.categoryService.getBreadcrumbs(normalizedCategoryId),
        enabled: normalizedCategoryId.length > 0,
        placeholderData: (previousData) => previousData,
    });
};
