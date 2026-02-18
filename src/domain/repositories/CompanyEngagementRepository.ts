import type {
    CompanyEngagementStats,
    TrackProductViewInput,
} from "@/domain/models/CompanyEngagementStats";

export interface CompanyEngagementRepository {
    getCompanyStats(
        companyId: string,
        period?: { from?: string; to?: string }
    ): Promise<CompanyEngagementStats>;

    trackProductView(input: TrackProductViewInput): void;
}

