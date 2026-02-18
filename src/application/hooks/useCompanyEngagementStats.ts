import { useQuery } from "@tanstack/react-query";
import { companyEngagementService } from "@/compositionRoot";

export const COMPANY_ENGAGEMENT_QUERY_KEY = ["companyEngagementStats"] as const;

export const useCompanyEngagementStats = (
    companyId: string | null | undefined,
    period?: { from?: string; to?: string }
) => {
    return useQuery({
        queryKey: [
            ...COMPANY_ENGAGEMENT_QUERY_KEY,
            companyId ?? null,
            period?.from ?? null,
            period?.to ?? null,
        ],
        queryFn: () => companyEngagementService.getCompanyStats(companyId!, period),
        enabled: Boolean(companyId),
    });
};

