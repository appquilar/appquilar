import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, Clock3, ExternalLink, Minus } from "lucide-react";

import type {
    PlatformAttentionItem,
    PlatformCategoryBreakdown,
    PlatformInsight,
    PlatformMetricAvailability,
    PlatformMetricCard,
    PlatformPlanDistribution,
    PlatformRankingItem,
    PlatformUsageItem,
} from "@/domain/models/AdminPlatformAnalytics";
import {
    formatDemandOfferRatio,
    formatPlainMetricValue,
    formatPlatformMetricValue,
} from "@/components/dashboard/analytics/platformAnalyticsFormat";
import { AdvancedStatsDeltaBadge } from "@/components/dashboard/stats/AdvancedStatsDeltaBadge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const AvailabilityBadge = ({
    availability,
}: {
    availability?: PlatformMetricAvailability;
}) => {
    if (!availability?.partial) {
        return null;
    }

    return (
        <Badge
            variant="secondary"
            className="rounded-full bg-amber-100 text-amber-800 hover:bg-amber-100"
        >
            Parcial
        </Badge>
    );
};

export const AnalyticsMetricCard = ({
    card,
    className,
}: {
    card: PlatformMetricCard;
    className?: string;
}) => (
    <Card className={cn("border-slate-200/80 bg-white/95 shadow-sm", className)}>
        <CardHeader className="space-y-3 pb-3">
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <CardTitle className="text-sm font-semibold text-[#0F172A]">
                        {card.label}
                    </CardTitle>
                    {card.helperText ? (
                        <CardDescription className="text-xs text-[#0F172A]/55">
                            {card.helperText}
                        </CardDescription>
                    ) : null}
                </div>
                <AvailabilityBadge availability={card.availability} />
            </div>
        </CardHeader>
        <CardContent className="space-y-3">
            <div className="text-2xl font-bold tracking-tight text-[#0F172A]">
                {formatPlatformMetricValue(card)}
            </div>
            {card.value != null ? (
                <AdvancedStatsDeltaBadge
                    delta={card.delta}
                    trendPreference={card.trendPreference ?? "higher"}
                />
            ) : null}
            {card.availability && !card.availability.available && card.availability.reason ? (
                <p className="text-xs text-[#0F172A]/50">{card.availability.reason}</p>
            ) : null}
            {card.availability?.partial && card.availability.reason ? (
                <p className="text-xs text-[#0F172A]/50">{card.availability.reason}</p>
            ) : null}
        </CardContent>
    </Card>
);

export const AnalyticsEmptyState = ({
    title,
    description,
    compact = false,
}: {
    title: string;
    description: string;
    compact?: boolean;
}) => (
    <div
        className={cn(
            "rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-5 text-sm text-[#0F172A]/60",
            compact ? "p-4" : "p-5"
        )}
    >
        <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-white p-2 text-slate-500 shadow-sm">
                <AlertCircle className="h-4 w-4" />
            </div>
            <div className="space-y-1">
                <p className="font-semibold text-[#0F172A]">{title}</p>
                <p>{description}</p>
            </div>
        </div>
    </div>
);

export const AnalyticsSectionCard = ({
    title,
    description,
    children,
    className,
}: {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
}) => (
    <Card className={cn("border-slate-200/80 bg-white/95 shadow-sm", className)}>
        <CardHeader className="space-y-1.5">
            <CardTitle className="text-base text-[#0F172A]">{title}</CardTitle>
            {description ? (
                <CardDescription className="text-sm text-[#0F172A]/55">
                    {description}
                </CardDescription>
            ) : null}
        </CardHeader>
        <CardContent>{children}</CardContent>
    </Card>
);

export const AnalyticsLinkList = ({
    items,
    emptyTitle,
    emptyDescription,
}: {
    items: PlatformAttentionItem[];
    emptyTitle: string;
    emptyDescription: string;
}) => {
    if (items.length === 0) {
        return (
            <AnalyticsEmptyState
                title={emptyTitle}
                description={emptyDescription}
                compact
            />
        );
    }

    return (
        <div className="space-y-3">
            {items.map((item) => (
                <Link
                    key={item.key}
                    to={item.href}
                    className="group flex items-start justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 px-4 py-3 transition-colors hover:border-[#F19D70]/40 hover:bg-[#F19D70]/5"
                >
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-[#0F172A]">{item.title}</p>
                        <p className="text-sm text-[#0F172A]/60">{item.description}</p>
                    </div>
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#C86A35]" />
                </Link>
            ))}
        </div>
    );
};

export const AnalyticsInsightList = ({
    insights,
}: {
    insights: PlatformInsight[];
}) => {
    if (insights.length === 0) {
        return (
            <AnalyticsEmptyState
                title="Sin insights automáticos"
                description="Todavía no hay señales deterministas suficientes para destacar este período."
                compact
            />
        );
    }

    return (
        <div className="space-y-3">
            {insights.map((insight) => (
                <div
                    key={insight.key}
                    className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3"
                >
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-[#0F172A]">{insight.title}</p>
                        <Badge
                            variant="secondary"
                            className={cn(
                                "rounded-full",
                                insight.severity === "success" && "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
                                insight.severity === "warning" && "bg-amber-100 text-amber-800 hover:bg-amber-100",
                                insight.severity === "info" && "bg-slate-100 text-slate-700 hover:bg-slate-100"
                            )}
                        >
                            {insight.severity === "warning"
                                ? "Atención"
                                : insight.severity === "success"
                                    ? "Oportunidad"
                                    : "Señal"}
                        </Badge>
                    </div>
                    <p className="mt-1.5 text-sm text-[#0F172A]/60">{insight.description}</p>
                    {insight.metrics.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {insight.metrics.map((metric) => (
                                <span
                                    key={`${insight.key}-${metric.label}`}
                                    className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-[#0F172A]/70"
                                >
                                    {metric.label}: {formatPlainMetricValue(metric.value, metric.format)}
                                </span>
                            ))}
                        </div>
                    ) : null}
                </div>
            ))}
        </div>
    );
};

export const AnalyticsRankingList = ({
    items,
    format = "count",
    emptyTitle,
    emptyDescription,
}: {
    items: PlatformRankingItem[];
    format?: PlatformMetricCard["format"];
    emptyTitle: string;
    emptyDescription: string;
}) => {
    if (items.length === 0) {
        return (
            <AnalyticsEmptyState
                title={emptyTitle}
                description={emptyDescription}
                compact
            />
        );
    }

    return (
        <div className="space-y-3">
            {items.map((item, index) => (
                <Link
                    key={item.key}
                    to={item.href}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 px-4 py-3 transition-colors hover:border-[#F19D70]/40 hover:bg-[#F19D70]/5"
                >
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-[#0F172A]">
                            {index + 1}. {item.label}
                        </p>
                        {item.helperText ? (
                            <p className="text-xs text-[#0F172A]/55">{item.helperText}</p>
                        ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#0F172A]">
                            {formatPlainMetricValue(item.value, format)}
                        </span>
                        <ExternalLink className="h-4 w-4 text-slate-400 transition-colors group-hover:text-[#C86A35]" />
                    </div>
                </Link>
            ))}
        </div>
    );
};

export const AnalyticsCategoryTable = ({
    rows,
    emptyTitle,
    emptyDescription,
}: {
    rows: PlatformCategoryBreakdown[];
    emptyTitle: string;
    emptyDescription: string;
}) => {
    if (rows.length === 0) {
        return (
            <AnalyticsEmptyState
                title={emptyTitle}
                description={emptyDescription}
                compact
            />
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80">
            <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.12em] text-[#0F172A]/55">
                    <tr>
                        <th className="px-4 py-3 font-medium">Categoría</th>
                        <th className="px-4 py-3 font-medium">Oferta</th>
                        <th className="px-4 py-3 font-medium">Demanda</th>
                        <th className="px-4 py-3 font-medium">Ratio</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.categoryId} className="border-t border-slate-200/80 bg-white">
                            <td className="px-4 py-3 font-medium text-[#0F172A]">{row.categoryName}</td>
                            <td className="px-4 py-3 text-[#0F172A]/70">{row.publishedProducts.toLocaleString("es-ES")}</td>
                            <td className="px-4 py-3 text-[#0F172A]/70">{row.conversationThreads.toLocaleString("es-ES")}</td>
                            <td className="px-4 py-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-medium text-[#0F172A]">
                                        {formatDemandOfferRatio(row.demandOfferRatio)}
                                    </span>
                                    <AdvancedStatsDeltaBadge delta={row.delta} />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export const AnalyticsPlanDistributionTable = ({
    items,
}: {
    items: PlatformPlanDistribution[];
}) => {
    if (items.length === 0) {
        return (
            <AnalyticsEmptyState
                title="Sin distribución de planes"
                description="Todavía no hay cuentas suficientes para mostrar una distribución relevante."
                compact
            />
        );
    }

    return (
        <div className="space-y-3">
            {items.map((item) => (
                <div
                    key={item.key}
                    className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/60 px-4 py-3"
                >
                    <div>
                        <p className="text-sm font-semibold text-[#0F172A]">{item.label}</p>
                        <p className="text-xs text-[#0F172A]/55">
                            {item.paid ? "Pago" : "Free"} · {item.active.toLocaleString("es-ES")} activas
                        </p>
                    </div>
                    <span className="text-sm font-semibold text-[#0F172A]">
                        {item.total.toLocaleString("es-ES")}
                    </span>
                </div>
            ))}
        </div>
    );
};

export const AnalyticsUsageList = ({
    items,
    emptyTitle,
    emptyDescription,
}: {
    items: PlatformUsageItem[];
    emptyTitle: string;
    emptyDescription: string;
}) => {
    if (items.length === 0) {
        return (
            <AnalyticsEmptyState
                title={emptyTitle}
                description={emptyDescription}
                compact
            />
        );
    }

    return (
        <div className="space-y-3">
            {items.map((item) => (
                <Link
                    key={item.key}
                    to={item.href}
                    className="group block rounded-2xl border border-slate-200/80 bg-slate-50/60 px-4 py-3 transition-colors hover:border-[#F19D70]/40 hover:bg-[#F19D70]/5"
                >
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-[#0F172A]">{item.ownerName}</p>
                            <p className="text-xs text-[#0F172A]/55">{item.planLabel}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-[#0F172A]">
                                {item.used}/{item.limit}
                            </p>
                            <p className="text-xs text-[#0F172A]/55">
                                {(item.usageRatio * 100).toLocaleString("es-ES", {
                                    maximumFractionDigits: 0,
                                })}
                                % usado
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                            className="h-full rounded-full bg-[#F19D70]"
                            style={{ width: `${Math.min(item.usageRatio * 100, 100)}%` }}
                        />
                    </div>
                </Link>
            ))}
        </div>
    );
};

export const AnalyticsUnsupportedList = ({
    items,
}: {
    items: Array<{
        key: string;
        label: string;
        availability: PlatformMetricAvailability;
    }>;
}) => (
    <div className="space-y-3">
        {items.map((item) => (
            <div
                key={item.key}
                className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3"
            >
                <div className="flex items-center gap-2">
                    <Minus className="h-4 w-4 text-slate-400" />
                    <p className="text-sm font-semibold text-[#0F172A]">{item.label}</p>
                </div>
                <p className="mt-1.5 text-sm text-[#0F172A]/60">
                    {item.availability.reason}
                </p>
            </div>
        ))}
    </div>
);

export const AnalyticsSeriesPlaceholder = ({
    title,
    description,
}: {
    title: string;
    description: string;
}) => (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 px-4 py-3">
        <div className="rounded-full bg-white p-2 shadow-sm">
            <Clock3 className="h-4 w-4 text-slate-500" />
        </div>
        <div>
            <p className="text-sm font-semibold text-[#0F172A]">{title}</p>
            <p className="text-sm text-[#0F172A]/60">{description}</p>
        </div>
    </div>
);
