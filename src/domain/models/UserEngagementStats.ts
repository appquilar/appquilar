export interface UserEngagementPeriod {
    from: string;
    to: string;
}

export interface UserEngagementSummary {
    totalViews: number;
    uniqueVisitors: number;
    messagesTotal: number;
    messageThreads: number;
}

export interface UserEngagementSeriesPointViews {
    day: string;
    views: number;
}

export interface UserEngagementSeriesPointMessages {
    day: string;
    messages: number;
}

export interface UserEngagementByProduct {
    productId: string;
    productName: string;
    productSlug: string;
    totalViews: number;
    uniqueVisitors: number;
    messagesTotal: number;
    messageThreads: number;
}

export interface UserEngagementStats {
    userId: string;
    period: UserEngagementPeriod;
    summary: UserEngagementSummary;
    dailyViews: UserEngagementSeriesPointViews[];
    dailyMessages: UserEngagementSeriesPointMessages[];
    byProduct: UserEngagementByProduct[];
}

