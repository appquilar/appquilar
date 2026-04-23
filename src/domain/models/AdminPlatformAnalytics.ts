export type PlatformMetricDeltaKind = "increase" | "decrease" | "neutral" | "new";
export type PlatformMetricFormat = "count" | "percentage" | "duration_minutes";
export type PlatformTrendPreference = "higher" | "lower";
export type PlatformInsightSeverity = "info" | "warning" | "success";

export interface PlatformAnalyticsPeriod {
    from: string;
    to: string;
}

export interface PlatformMetricDelta {
    kind: PlatformMetricDeltaKind;
    absoluteChange: number;
    percentageChange: number;
}

export interface PlatformMetricAvailability {
    available: boolean;
    partial?: boolean;
    reason?: string;
}

export interface PlatformMetricCard {
    key: string;
    label: string;
    value: number | null;
    format: PlatformMetricFormat;
    delta: PlatformMetricDelta;
    trendPreference?: PlatformTrendPreference;
    availability?: PlatformMetricAvailability;
    helperText?: string;
}

export interface PlatformActivationStep {
    key: string;
    label: string;
    value: number;
    previousValue: number | null;
    shareOfFirstStep: number;
    conversionFromPrevious: number | null;
    dropOffFromPrevious: number | null;
    delta: PlatformMetricDelta;
    availability?: PlatformMetricAvailability;
}

export interface PlatformSeriesPoint {
    day: string;
    value: number;
}

export interface PlatformInsightMetric {
    label: string;
    value: number;
    format: PlatformMetricFormat;
}

export interface PlatformInsight {
    key: string;
    title: string;
    description: string;
    severity: PlatformInsightSeverity;
    metrics: PlatformInsightMetric[];
}

export interface PlatformAttentionItem {
    key: string;
    title: string;
    description: string;
    severity: PlatformInsightSeverity;
    href: string;
}

export interface PlatformPlanDistribution {
    key: string;
    label: string;
    total: number;
    active: number;
    paid: boolean;
}

export interface PlatformCategoryBreakdown {
    categoryId: string;
    categoryName: string;
    publishedProducts: number;
    conversationThreads: number;
    previousConversationThreads: number;
    demandOfferRatio: number;
    delta: PlatformMetricDelta;
}

export interface PlatformRankingItem {
    key: string;
    label: string;
    value: number | null;
    helperText?: string;
    href: string;
}

export interface PlatformUsageItem {
    key: string;
    label: string;
    ownerName: string;
    used: number;
    limit: number;
    usageRatio: number;
    planLabel: string;
    href: string;
}

export interface PlatformExecutiveSummary {
    cards: PlatformMetricCard[];
}

export interface PlatformActivationSnapshot {
    steps: PlatformActivationStep[];
    notes: string[];
}

export interface PlatformOperationsStats {
    cards: PlatformMetricCard[];
    bestResponders: PlatformRankingItem[];
    slowResponders: PlatformRankingItem[];
    dailyMessages: PlatformSeriesPoint[];
}

export interface PlatformMarketplaceHealth {
    categories: PlatformCategoryBreakdown[];
    growthCategories: PlatformCategoryBreakdown[];
    weakCategories: PlatformCategoryBreakdown[];
    unsupportedSections: Array<{
        key: string;
        label: string;
        availability: PlatformMetricAvailability;
    }>;
}

export interface PlatformMonetizationStats {
    cards: PlatformMetricCard[];
    planDistribution: PlatformPlanDistribution[];
    upgradeCandidates: PlatformAttentionItem[];
    nearLimitAccounts: PlatformUsageItem[];
}

export interface PlatformQualityRiskStats {
    cards: PlatformMetricCard[];
    productsWithoutImage: PlatformAttentionItem[];
    productsWithoutPrice: PlatformAttentionItem[];
    dormantCompanies: PlatformAttentionItem[];
    actionItems: PlatformAttentionItem[];
}

export interface PlatformRetentionStats {
    availability: PlatformMetricAvailability;
}

export interface PlatformOverviewSnapshot {
    cards: PlatformMetricCard[];
    planDistribution: PlatformPlanDistribution[];
    dailyViews: PlatformSeriesPoint[];
    dailyMessages: PlatformSeriesPoint[];
}

export interface AdminPlatformHomepageAnalytics {
    period: PlatformAnalyticsPeriod;
    previousPeriod: PlatformAnalyticsPeriod;
    executiveSummary: PlatformExecutiveSummary;
    activation: PlatformActivationSnapshot;
    operations: PlatformOperationsStats;
    marketplace: PlatformMarketplaceHealth;
    insights: PlatformInsight[];
    attentionItems: PlatformAttentionItem[];
    callToActionHref: string;
}

export interface AdminPlatformDetailAnalytics {
    period: PlatformAnalyticsPeriod;
    previousPeriod: PlatformAnalyticsPeriod;
    homepage: AdminPlatformHomepageAnalytics;
    overview: PlatformOverviewSnapshot;
    activation: PlatformActivationSnapshot;
    marketplace: PlatformMarketplaceHealth;
    operations: PlatformOperationsStats;
    monetization: PlatformMonetizationStats;
    qualityRisk: PlatformQualityRiskStats;
    retention: PlatformRetentionStats;
}
