import { useQuery } from "@tanstack/react-query";

import { publicCompanyProductsService } from "@/compositionRoot";

export const usePublicCompanyProducts = (
    companySlug: string | null | undefined,
    page: number,
    perPage: number
) => {
    return useQuery({
        queryKey: ["products", "public-company", companySlug, page, perPage],
        queryFn: () => publicCompanyProductsService.listByCompanySlug(companySlug!, page, perPage),
        enabled: Boolean(companySlug),
        placeholderData: (previousData) => previousData,
        staleTime: 5 * 60 * 1000,
    });
};
