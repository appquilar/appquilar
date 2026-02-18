export interface EngagementPeriod {
    from: string;
    to: string;
}

export interface EngagementSummary {
    totalViews: number;
    uniqueVisitors: number;
    repeatVisitors: number;
    repeatVisitorRatio: number;
    loggedViews: number;
    anonymousViews: number;
    messagesTotal: number;
    messageThreads: number;
    messageToRentalRatio: number;
    averageFirstResponseMinutes: number | null;
}

export interface EngagementLocation {
    country: string;
    region: string;
    city: string;
    totalViews: number;
    uniqueVisitors: number;
}

export interface EngagementSeriesPointViews {
    day: string;
    views: number;
}

export interface EngagementSeriesPointMessages {
    day: string;
    messages: number;
}

export interface EngagementByProduct {
    productId: string;
    productName: string;
    productSlug: string;
    totalViews: number;
    uniqueVisitors: number;
    loggedViews: number;
    anonymousViews: number;
    messagesTotal: number;
    messageThreads: number;
    visitToMessageRatio: number;
    messageToRentalRatio: number;
}

export interface EngagementOpportunity {
    highInterestLowConversion: EngagementByProduct | null;
}

export interface CompanyEngagementStats {
    companyId: string;
    period: EngagementPeriod;
    summary: EngagementSummary;
    topLocations: EngagementLocation[];
    dailyViews: EngagementSeriesPointViews[];
    dailyMessages: EngagementSeriesPointMessages[];
    byProduct: EngagementByProduct[];
    opportunities: EngagementOpportunity;
}

export interface TrackProductViewInput {
    productId: string;
    anonymousId: string | null;
    sessionId: string | null;
    dwellTimeMs: number;
    occurredAt: string;
}

