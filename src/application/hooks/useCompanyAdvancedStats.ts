import { useQuery } from "@tanstack/react-query";
import { companyAdvancedStatsService } from "@/compositionRoot";

export const COMPANY_ADVANCED_STATS_QUERY_KEY = ["companyAdvancedStats"] as const;

export const useCompanyAdvancedStats = (
    companyId: string | null | undefined,
    period?: { from?: string; to?: string },
    enabled = true
) => {
    return useQuery({
        queryKey: [
            ...COMPANY_ADVANCED_STATS_QUERY_KEY,
            companyId ?? null,
            period?.from ?? null,
            period?.to ?? null,
        ],
        queryFn: () => companyAdvancedStatsService.getCompanyAdvancedStats(companyId!, period),
        enabled: enabled && Boolean(companyId),
    });
};
