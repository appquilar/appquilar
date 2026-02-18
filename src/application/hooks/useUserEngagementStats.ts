import { useQuery } from "@tanstack/react-query";
import { userEngagementService } from "@/compositionRoot";

export const USER_ENGAGEMENT_QUERY_KEY = ["userEngagementStats"] as const;

export const useUserEngagementStats = (
    userId: string | null | undefined,
    period?: { from?: string; to?: string }
) => {
    return useQuery({
        queryKey: [
            ...USER_ENGAGEMENT_QUERY_KEY,
            userId ?? null,
            period?.from ?? null,
            period?.to ?? null,
        ],
        queryFn: () => userEngagementService.getUserStats(userId!, period),
        enabled: Boolean(userId),
    });
};

