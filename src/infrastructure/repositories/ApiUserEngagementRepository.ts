import { ApiClient } from "@/infrastructure/http/ApiClient";
import type { AuthSession } from "@/domain/models/AuthSession";
import { toAuthorizationHeader } from "@/domain/models/AuthSession";
import type {
    UserEngagementByProduct,
    UserEngagementStats,
} from "@/domain/models/UserEngagementStats";
import type { UserEngagementRepository } from "@/domain/repositories/UserEngagementRepository";

type UserEngagementByProductDto = {
    product_id: string;
    product_name: string;
    product_slug: string;
    total_views: number;
    unique_visitors: number;
    messages_total: number;
    message_threads: number;
};

type UserEngagementStatsDto = {
    user_id: string;
    period: {
        from: string;
        to: string;
    };
    summary: {
        total_views: number;
        unique_visitors: number;
        messages_total: number;
        message_threads: number;
    };
    series: {
        daily_views: Array<{ day: string; views: number }>;
        daily_messages: Array<{ day: string; messages: number }>;
    };
    by_product: UserEngagementByProductDto[];
};

type WrappedStatsResponse = {
    success?: boolean;
    data?: UserEngagementStatsDto;
};

export class ApiUserEngagementRepository implements UserEngagementRepository {
    constructor(
        private readonly apiClient: ApiClient,
        private readonly getSession: () => AuthSession | null
    ) {
    }

    async getUserStats(
        userId: string,
        period?: { from?: string; to?: string }
    ): Promise<UserEngagementStats> {
        const search = new URLSearchParams();
        if (period?.from) {
            search.set("from", period.from);
        }
        if (period?.to) {
            search.set("to", period.to);
        }

        const query = search.toString();
        const path = `/api/users/${encodeURIComponent(userId)}/stats/engagement${query ? `?${query}` : ""}`;

        const raw = await this.apiClient.get<UserEngagementStatsDto | WrappedStatsResponse>(path, {
            headers: this.authHeaders(),
        });

        const dto = this.unwrap(raw);

        return {
            userId: dto.user_id,
            period: {
                from: dto.period.from,
                to: dto.period.to,
            },
            summary: {
                totalViews: dto.summary.total_views,
                uniqueVisitors: dto.summary.unique_visitors,
                messagesTotal: dto.summary.messages_total,
                messageThreads: dto.summary.message_threads,
            },
            dailyViews: dto.series.daily_views.map((row) => ({
                day: row.day,
                views: row.views,
            })),
            dailyMessages: dto.series.daily_messages.map((row) => ({
                day: row.day,
                messages: row.messages,
            })),
            byProduct: dto.by_product.map(this.mapByProduct),
        };
    }

    private mapByProduct(dto: UserEngagementByProductDto): UserEngagementByProduct {
        return {
            productId: dto.product_id,
            productName: dto.product_name,
            productSlug: dto.product_slug,
            totalViews: dto.total_views,
            uniqueVisitors: dto.unique_visitors,
            messagesTotal: dto.messages_total,
            messageThreads: dto.message_threads,
        };
    }

    private unwrap(raw: UserEngagementStatsDto | WrappedStatsResponse): UserEngagementStatsDto {
        if (raw && typeof raw === "object" && "data" in raw && raw.data) {
            return raw.data;
        }

        return raw as UserEngagementStatsDto;
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

