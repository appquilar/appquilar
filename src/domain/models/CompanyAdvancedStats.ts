export type AdvancedStatsDeltaKind = "increase" | "decrease" | "neutral" | "new";
export type AdvancedStatsValueFormat = "percentage" | "count" | "duration_minutes";
export type AdvancedStatsTrendPreference = "higher" | "lower";
export type AdvancedStatsSeverity = "info" | "warning" | "success";

export interface AdvancedStatsDelta {
    kind: AdvancedStatsDeltaKind;
    absoluteChange: number;
    percentageChange: number;
}

export interface AdvancedStatsAvailability {
    available: boolean;
    partial?: boolean;
    reason?: string;
}

export interface AdvancedStatsExportOption {
    available: boolean;
    reason: string;
}

export interface CompanyAdvancedStatsPeriod {
    from: string;
    to: string;
}

export interface CompanyAdvancedStatsKpi {
    key:
        | "visit_to_conversation"
        | "unique_to_conversation"
        | "message_to_rental"
        | "average_first_response_minutes";
    label: string;
    description: string;
    format: AdvancedStatsValueFormat;
    trendPreference: AdvancedStatsTrendPreference;
    currentValue: number | null;
    previousValue: number | null;
    delta: AdvancedStatsDelta;
}

export interface CompanyAdvancedStatsFunnelStep {
    key: "total_views" | "unique_visitors" | "message_threads";
    label: string;
    value: number;
    shareOfFirstStep: number;
    conversionFromPrevious: number | null;
}

export interface CompanyAdvancedStatsFunnel {
    steps: CompanyAdvancedStatsFunnelStep[];
    overallConversionRate: number;
    previousOverallConversionRate: number;
    delta: AdvancedStatsDelta;
}

export interface CompanyAdvancedStatsProductRow {
    productId: string;
    productName: string;
    productSlug: string;
    productInternalId: string;
    totalViews: number;
    uniqueVisitors: number;
    messageThreads: number;
    visitToConversationRate: number;
    uniqueToConversationRate: number;
    messageToRentalRate: number;
    deltaVsPrevious: AdvancedStatsDelta;
}

export interface CompanyAdvancedStatsInsightMetric {
    label: string;
    value: number;
    format: AdvancedStatsValueFormat;
}

export interface CompanyAdvancedStatsInsight {
    key: string;
    title: string;
    description: string;
    severity: AdvancedStatsSeverity;
    productId?: string;
    productName?: string;
    metrics: CompanyAdvancedStatsInsightMetric[];
}

export interface CompanyAdvancedStatsResponsePerformance {
    averageFirstResponse: CompanyAdvancedStatsKpi;
    helperText: string;
}

export interface CompanyAdvancedStatsSectionAvailability {
    funnel: AdvancedStatsAvailability;
    conversionRates: AdvancedStatsAvailability;
    responsePerformance: AdvancedStatsAvailability;
    trafficSources: AdvancedStatsAvailability;
    lostDemand: AdvancedStatsAvailability;
}

export interface CompanyAdvancedStatsExportReadiness {
    csv: AdvancedStatsExportOption;
    pdf: AdvancedStatsExportOption;
}

export interface CompanyAdvancedStats {
    companyId: string;
    period: CompanyAdvancedStatsPeriod;
    previousPeriod: CompanyAdvancedStatsPeriod;
    funnel: CompanyAdvancedStatsFunnel;
    conversionKpis: CompanyAdvancedStatsKpi[];
    responsePerformance: CompanyAdvancedStatsResponsePerformance;
    productConversionRows: CompanyAdvancedStatsProductRow[];
    insights: CompanyAdvancedStatsInsight[];
    sectionAvailability: CompanyAdvancedStatsSectionAvailability;
    exportReadiness: CompanyAdvancedStatsExportReadiness;
    hasAnyData: boolean;
}
