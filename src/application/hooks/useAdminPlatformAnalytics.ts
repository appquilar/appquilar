import { useQuery } from "@tanstack/react-query";

import type {
    AdminPlatformDetailAnalytics,
    AdminPlatformHomepageAnalytics,
    PlatformActivationSnapshot,
    PlatformMarketplaceHealth,
    PlatformMonetizationStats,
    PlatformOperationsStats,
    PlatformOverviewSnapshot,
    PlatformQualityRiskStats,
} from "@/domain/models/AdminPlatformAnalytics";
import { useAuth } from "@/context/AuthContext";
import { adminPlatformAnalyticsService } from "@/compositionRoot";
import { isPlatformAdminUser } from "@/domain/models/User";

export const ADMIN_PLATFORM_ANALYTICS_QUERY_KEY = ["adminPlatformAnalytics"] as const;

type AnalyticsPeriodInput = {
    from?: string;
    to?: string;
};

const buildAdminPlatformAnalyticsQuery = (
    isAdmin: boolean,
    period?: AnalyticsPeriodInput
) => ({
    queryKey: [
        ...ADMIN_PLATFORM_ANALYTICS_QUERY_KEY,
        period?.from ?? null,
        period?.to ?? null,
    ],
    queryFn: () => adminPlatformAnalyticsService.getAdminPlatformAnalytics(period),
    enabled: isAdmin,
});

export const useAdminPlatformAnalytics = (period?: AnalyticsPeriodInput) => {
    const { currentUser } = useAuth();
    const isAdmin = isPlatformAdminUser(currentUser);

    return useQuery<AdminPlatformDetailAnalytics>(
        buildAdminPlatformAnalyticsQuery(isAdmin, period)
    );
};

const useAdminPlatformAnalyticsSlice = <TData>(
    period: AnalyticsPeriodInput | undefined,
    select: (analytics: AdminPlatformDetailAnalytics) => TData
) => {
    const { currentUser } = useAuth();
    const isAdmin = isPlatformAdminUser(currentUser);

    return useQuery({
        ...buildAdminPlatformAnalyticsQuery(isAdmin, period),
        select,
    });
};

export const useAdminPlatformHomepageAnalytics = (period?: AnalyticsPeriodInput) =>
    useAdminPlatformAnalyticsSlice<AdminPlatformHomepageAnalytics>(
        period,
        (analytics) => analytics.homepage
    );

export const useAdminPlatformOverview = (period?: AnalyticsPeriodInput) =>
    useAdminPlatformAnalyticsSlice<PlatformOverviewSnapshot>(
        period,
        (analytics) => analytics.overview
    );

export const useAdminPlatformActivation = (period?: AnalyticsPeriodInput) =>
    useAdminPlatformAnalyticsSlice<PlatformActivationSnapshot>(
        period,
        (analytics) => analytics.activation
    );

export const useAdminPlatformMarketplace = (period?: AnalyticsPeriodInput) =>
    useAdminPlatformAnalyticsSlice<PlatformMarketplaceHealth>(
        period,
        (analytics) => analytics.marketplace
    );

export const useAdminPlatformOperations = (period?: AnalyticsPeriodInput) =>
    useAdminPlatformAnalyticsSlice<PlatformOperationsStats>(
        period,
        (analytics) => analytics.operations
    );

export const useAdminPlatformMonetization = (period?: AnalyticsPeriodInput) =>
    useAdminPlatformAnalyticsSlice<PlatformMonetizationStats>(
        period,
        (analytics) => analytics.monetization
    );

export const useAdminPlatformQualityRisk = (period?: AnalyticsPeriodInput) =>
    useAdminPlatformAnalyticsSlice<PlatformQualityRiskStats>(
        period,
        (analytics) => analytics.qualityRisk
    );
