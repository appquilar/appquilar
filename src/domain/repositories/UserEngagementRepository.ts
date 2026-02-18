import type { UserEngagementStats } from "@/domain/models/UserEngagementStats";

export interface UserEngagementRepository {
    getUserStats(
        userId: string,
        period?: { from?: string; to?: string }
    ): Promise<UserEngagementStats>;
}

