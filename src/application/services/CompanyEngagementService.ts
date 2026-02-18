import type {
    CompanyEngagementStats,
    TrackProductViewInput,
} from "@/domain/models/CompanyEngagementStats";
import type { CompanyEngagementRepository } from "@/domain/repositories/CompanyEngagementRepository";

export class CompanyEngagementService {
    constructor(
        private readonly repository: CompanyEngagementRepository
    ) {
    }

    async getCompanyStats(
        companyId: string,
        period?: { from?: string; to?: string }
    ): Promise<CompanyEngagementStats> {
        return this.repository.getCompanyStats(companyId, period);
    }

    trackProductView(input: TrackProductViewInput): void {
        this.repository.trackProductView(input);
    }
}

