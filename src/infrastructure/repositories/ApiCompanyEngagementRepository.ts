import { ApiClient } from "@/infrastructure/http/ApiClient";
import type { AuthSession } from "@/domain/models/AuthSession";
import { toAuthorizationHeader } from "@/domain/models/AuthSession";
import type {
    CompanyEngagementStats,
    EngagementByProduct,
    TrackProductViewInput,
} from "@/domain/models/CompanyEngagementStats";
import type { CompanyEngagementRepository } from "@/domain/repositories/CompanyEngagementRepository";

type CompanyEngagementByProductDto = {
    product_id: string;
    product_name: string;
    product_slug: string;
    total_views: number;
    unique_visitors: number;
    logged_views: number;
    anonymous_views: number;
    messages_total: number;
    message_threads: number;
    visit_to_message_ratio: number;
    message_to_rental_ratio: number;
};

type CompanyEngagementStatsDto = {
    company_id: string;
    period: {
        from: string;
        to: string;
    };
    summary: {
        total_views: number;
        unique_visitors: number;
        repeat_visitors: number;
        repeat_visitor_ratio: number;
        logged_views: number;
        anonymous_views: number;
        messages_total: number;
        message_threads: number;
        message_to_rental_ratio: number;
        average_first_response_minutes: number | null;
    };
    top_locations: Array<{
        country: string;
        region: string;
        city: string;
        total_views: number;
        unique_visitors: number;
    }>;
    series: {
        daily_views: Array<{ day: string; views: number }>;
        daily_messages: Array<{ day: string; messages: number }>;
    };
    by_product: CompanyEngagementByProductDto[];
    opportunities: {
        high_interest_low_conversion: CompanyEngagementByProductDto | null;
    };
};

type WrappedStatsResponse = {
    success?: boolean;
    data?: CompanyEngagementStatsDto;
};

export class ApiCompanyEngagementRepository implements CompanyEngagementRepository {
    constructor(
        private readonly apiClient: ApiClient,
        private readonly getSession: () => AuthSession | null
    ) {
    }

    async getCompanyStats(
        companyId: string,
        period?: { from?: string; to?: string }
    ): Promise<CompanyEngagementStats> {
        const search = new URLSearchParams();
        if (period?.from) {
            search.set("from", period.from);
        }
        if (period?.to) {
            search.set("to", period.to);
        }

        const query = search.toString();
        const path = `/api/companies/${encodeURIComponent(companyId)}/stats/engagement${query ? `?${query}` : ""}`;

        const raw = await this.apiClient.get<CompanyEngagementStatsDto | WrappedStatsResponse>(path, {
            headers: this.authHeaders(),
        });

        const dto = this.unwrap(raw);

        return {
            companyId: dto.company_id,
            period: {
                from: dto.period.from,
                to: dto.period.to,
            },
            summary: {
                totalViews: dto.summary.total_views,
                uniqueVisitors: dto.summary.unique_visitors,
                repeatVisitors: dto.summary.repeat_visitors,
                repeatVisitorRatio: dto.summary.repeat_visitor_ratio,
                loggedViews: dto.summary.logged_views,
                anonymousViews: dto.summary.anonymous_views,
                messagesTotal: dto.summary.messages_total,
                messageThreads: dto.summary.message_threads,
                messageToRentalRatio: dto.summary.message_to_rental_ratio,
                averageFirstResponseMinutes: dto.summary.average_first_response_minutes,
            },
            topLocations: dto.top_locations.map((row) => ({
                country: row.country,
                region: row.region,
                city: row.city,
                totalViews: row.total_views,
                uniqueVisitors: row.unique_visitors,
            })),
            dailyViews: dto.series.daily_views.map((row) => ({
                day: row.day,
                views: row.views,
            })),
            dailyMessages: dto.series.daily_messages.map((row) => ({
                day: row.day,
                messages: row.messages,
            })),
            byProduct: dto.by_product.map(this.mapByProduct),
            opportunities: {
                highInterestLowConversion: dto.opportunities.high_interest_low_conversion
                    ? this.mapByProduct(dto.opportunities.high_interest_low_conversion)
                    : null,
            },
        };
    }

    trackProductView(input: TrackProductViewInput): void {
        this.apiClient.postBackground(
            `/api/public/products/${encodeURIComponent(input.productId)}/view`,
            {
                anonymous_id: input.anonymousId,
                session_id: input.sessionId,
                dwell_time_ms: input.dwellTimeMs,
                occurred_at: input.occurredAt,
            },
            {
                headers: this.authHeaders(),
            }
        );
    }

    private mapByProduct(dto: CompanyEngagementByProductDto): EngagementByProduct {
        return {
            productId: dto.product_id,
            productName: dto.product_name,
            productSlug: dto.product_slug,
            totalViews: dto.total_views,
            uniqueVisitors: dto.unique_visitors,
            loggedViews: dto.logged_views,
            anonymousViews: dto.anonymous_views,
            messagesTotal: dto.messages_total,
            messageThreads: dto.message_threads,
            visitToMessageRatio: dto.visit_to_message_ratio,
            messageToRentalRatio: dto.message_to_rental_ratio,
        };
    }

    private unwrap(raw: CompanyEngagementStatsDto | WrappedStatsResponse): CompanyEngagementStatsDto {
        if (raw && typeof raw === "object" && "data" in raw && raw.data) {
            return raw.data;
        }

        return raw as CompanyEngagementStatsDto;
    }

    private authHeaders(): Record<string, string> {
        const authHeader = toAuthorizationHeader(this.getSession());
        if (!authHeader) {
            return {};
        }

        return {
            Authorization: authHeader,
        };
    }
}

