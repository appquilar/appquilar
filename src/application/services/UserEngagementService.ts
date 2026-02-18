import type { UserEngagementRepository } from "@/domain/repositories/UserEngagementRepository";
import type { UserEngagementStats } from "@/domain/models/UserEngagementStats";

export class UserEngagementService {
    constructor(
        private readonly repository: UserEngagementRepository
    ) {
    }

    async getUserStats(
        userId: string,
        period?: { from?: string; to?: string }
    ): Promise<UserEngagementStats> {
        return this.repository.getUserStats(userId, period);
    }
}

