import { Link } from "react-router-dom";
import {
    ArrowRight,
} from "lucide-react";

import { useAdminPlatformHomepageAnalytics } from "@/application/hooks/useAdminPlatformAnalytics";
import EngagementLineChart from "@/components/dashboard/stats/EngagementLineChart";
import { StatsDateRangeToolbar } from "@/components/dashboard/stats/StatsDateRangeToolbar";
import {
    AnalyticsCategoryTable,
    AnalyticsEmptyState,
    AnalyticsInsightList,
    AnalyticsLinkList,
    AnalyticsMetricCard,
    AnalyticsRankingList,
    AnalyticsSectionCard,
    AnalyticsSeriesPlaceholder,
    AnalyticsUnsupportedList,
} from "@/components/dashboard/analytics/platformAnalyticsUi";
import { formatDemandOfferRatio } from "@/components/dashboard/analytics/platformAnalyticsFormat";
import { Button } from "@/components/ui/button";
import { useStatsDateRange } from "@/hooks/useStatsDateRange";
import type { PlatformCategoryBreakdown } from "@/domain/models/AdminPlatformAnalytics";

const CategorySignalList = ({
    title,
    description,
    rows,
}: {
    title: string;
    description: string;
    rows: PlatformCategoryBreakdown[];
}) => (
    <AnalyticsSectionCard title={title} description={description}>
        {rows.length === 0 ? (
            <AnalyticsEmptyState
                title="Sin señales por categoría"
                description="Con el rango actual no hay suficiente variación para destacar categorías."
                compact
            />
        ) : (
            <div className="space-y-3">
                {rows.map((row) => (
                    <div
                        key={`${title}-${row.categoryId}`}
                        className="rounded-2xl border border-slate-200/80 bg-slate-50/60 px-4 py-3"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-[#0F172A]">
                                    {row.categoryName}
                                </p>
                                <p className="text-xs text-[#0F172A]/55">
                                    {row.conversationThreads} conversaciones · {row.publishedProducts} productos
                                </p>
                            </div>
                            <p className="text-sm font-semibold text-[#0F172A]">
                                {formatDemandOfferRatio(row.demandOfferRatio)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </AnalyticsSectionCard>
);

export const AdminPlatformAnalyticsHomeSection = () => {
    const {
        range,
        period,
        rangeError,
        isDatePopoverOpen,
        setIsDatePopoverOpen,
        selectedRangeDays,
        maxRangeDays,
        handleRangeChange,
        applyLastDays,
        updateFromIsoDate,
        updateToIsoDate,
        isPresetRange,
    } = useStatsDateRange();
    const analyticsQuery = useAdminPlatformHomepageAnalytics(period);

    const toolbar = (
        <StatsDateRangeToolbar
            range={range}
            selectedRangeDays={selectedRangeDays}
            isDatePopoverOpen={isDatePopoverOpen}
            onDatePopoverOpenChange={setIsDatePopoverOpen}
            rangeError={rangeError}
            maxRangeDays={maxRangeDays}
            onApplyLastDays={applyLastDays}
            onRangeChange={handleRangeChange}
            onUpdateFromIsoDate={updateFromIsoDate}
            onUpdateToIsoDate={updateToIsoDate}
            isPresetRange={isPresetRange}
        />
    );

    if (analyticsQuery.isLoading) {
        return (
            <section className="space-y-4">
                {toolbar}
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div
                            key={`platform-analytics-skeleton-${index}`}
                            className="h-40 animate-pulse rounded-2xl border border-slate-200/80 bg-slate-100/80"
                        />
                    ))}
                </div>
            </section>
        );
    }

    if (analyticsQuery.isError) {
        return (
            <section className="space-y-4">
                {toolbar}
                <AnalyticsEmptyState
                    title="Error al cargar la analítica"
                    description="La capa admin-only no está disponible ahora mismo. Reintenta en unos segundos."
                />
            </section>
        );
    }

    if (!analyticsQuery.data) {
        return null;
    }

    const analytics = analyticsQuery.data;

    return (
        <section className="space-y-4">
            {toolbar}
            <p className="text-sm text-[#0F172A]/60">
                Señales rápidas de plataforma para admins, calculadas sólo con datos globales que hoy podemos mostrar con fiabilidad.
            </p>

            <AnalyticsSectionCard
                title="Resumen ejecutivo"
                description="Primera lectura de actividad, catálogo, conversación y monetización activa."
            >
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {analytics.executiveSummary.cards.map((card) => (
                        <AnalyticsMetricCard key={card.key} card={card} />
                    ))}
                </div>
            </AnalyticsSectionCard>

            <div className="grid gap-4 xl:grid-cols-2">
                <AnalyticsSectionCard
                    title="Activación y funnel"
                    description="Sólo etapas que hoy podemos medir con fiabilidad."
                >
                    <div className="space-y-3">
                        {analytics.activation.steps.map((step, index) => (
                            <div
                                key={step.key}
                                className="rounded-2xl border border-slate-200/80 bg-slate-50/60 px-4 py-3"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#0F172A]/45">
                                            Paso {index + 1}
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-[#0F172A]">
                                            {step.label}
                                        </p>
                                    </div>
                                    <p className="text-lg font-bold text-[#0F172A]">{step.value}</p>
                                </div>
                                <div className="mt-3 grid gap-2 text-xs text-[#0F172A]/60 sm:grid-cols-3">
                                    <span>Share del funnel: {(step.shareOfFirstStep * 100).toFixed(1)}%</span>
                                    <span>
                                        Conversión paso anterior: {step.conversionFromPrevious == null
                                            ? "No aplica"
                                            : `${(step.conversionFromPrevious * 100).toFixed(1)}%`}
                                    </span>
                                    <span>
                                        Drop-off: {step.dropOffFromPrevious == null
                                            ? "No aplica"
                                            : `${(step.dropOffFromPrevious * 100).toFixed(1)}%`}
                                    </span>
                                </div>
                                {step.availability?.reason ? (
                                    <p className="mt-2 text-xs text-[#0F172A]/50">{step.availability.reason}</p>
                                ) : null}
                            </div>
                        ))}
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3">
                            <p className="text-sm font-semibold text-[#0F172A]">Cobertura limitada</p>
                            <ul className="mt-2 space-y-1 text-sm text-[#0F172A]/60">
                                {analytics.activation.notes.map((note) => (
                                    <li key={note}>{note}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </AnalyticsSectionCard>

                <AnalyticsSectionCard
                    title="Operaciones"
                    description="Indicadores operativos disponibles sin recorrer mensajes ni derivar SLA fuera de contrato."
                >
                    <div className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            {analytics.operations.cards.map((card) => (
                                <AnalyticsMetricCard key={card.key} card={card} />
                            ))}
                        </div>
                        <div className="grid gap-4 xl:grid-cols-2">
                            <AnalyticsRankingList
                                items={analytics.operations.bestResponders}
                                format="duration_minutes"
                                emptyTitle="Sin mejores tiempos"
                                emptyDescription="Todavía no hay suficiente dato de respuesta para comparar compañías."
                            />
                            <AnalyticsRankingList
                                items={analytics.operations.slowResponders}
                                format="duration_minutes"
                                emptyTitle="Sin alertas de respuesta"
                                emptyDescription="No hay compañías con dato suficiente para destacar las más lentas."
                            />
                        </div>
                        {analytics.operations.dailyMessages.some((point) => point.value > 0) ? (
                            <div className="h-[260px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
                                <div className="px-4 pt-4">
                                    <p className="text-sm font-semibold text-[#0F172A]">
                                        Evolución de conversaciones
                                    </p>
                                    <p className="text-xs text-[#0F172A]/55">
                                        Serie agregada de mensajes diarios del rango seleccionado.
                                    </p>
                                </div>
                                <div className="h-[210px]">
                                    <EngagementLineChart
                                        data={analytics.operations.dailyMessages.map((point) => ({
                                            day: point.day.slice(5),
                                            value: point.value,
                                        }))}
                                        color="#F19D70"
                                        label="Mensajes"
                                    />
                                </div>
                            </div>
                        ) : (
                            <AnalyticsSeriesPlaceholder
                                title="Sin serie operativa"
                                description="Todavía no hay suficiente actividad diaria para pintar una tendencia útil."
                            />
                        )}
                    </div>
                </AnalyticsSectionCard>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                <AnalyticsSectionCard
                    title="Salud del marketplace"
                    description="Oferta, demanda y ratio demanda/oferta por categoría con soporte real del backend."
                >
                    <AnalyticsCategoryTable
                        rows={analytics.marketplace.categories}
                        emptyTitle="Sin categorías activas"
                        emptyDescription="No hay suficiente catálogo o conversación para construir el breakdown por categoría."
                    />
                </AnalyticsSectionCard>

                <div className="space-y-4">
                    <CategorySignalList
                        title="Categorías en crecimiento"
                        description="Mayor subida de conversaciones frente al período anterior."
                        rows={analytics.marketplace.growthCategories}
                    />
                    <CategorySignalList
                        title="Categorías débiles o saturadas"
                        description="Mucha oferta con poca conversación o conversión por producto baja."
                        rows={analytics.marketplace.weakCategories}
                    />
                    <AnalyticsSectionCard
                        title="Pendiente de cobertura"
                        description="Estos bloques aparecerán cuando tengamos datos globales suficientemente fiables."
                    >
                        <AnalyticsUnsupportedList
                            items={analytics.marketplace.unsupportedSections}
                        />
                    </AnalyticsSectionCard>
                </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                <AnalyticsSectionCard
                    title="Insights y alertas"
                    description="Reglas deterministas y mantenibles, sin IA externa."
                >
                    <AnalyticsInsightList insights={analytics.insights} />
                </AnalyticsSectionCard>

                <AnalyticsSectionCard
                    title="Atención inmediata"
                    description="Cuentas y compañías que requieren seguimiento manual rápido."
                >
                    <AnalyticsLinkList
                        items={analytics.attentionItems}
                        emptyTitle="Sin acciones urgentes"
                        emptyDescription="No hay cuentas que destaquen por riesgo o foco inmediato en este período."
                    />
                </AnalyticsSectionCard>
            </div>

            <AnalyticsSectionCard
                title="Ver más detalle"
                description="La homepage se queda en señales rápidas. El detalle profundo vive en la ruta dedicada para admins."
            >
                <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-[#0F172A]">
                            Abrir analítica completa
                        </p>
                        <p className="text-sm text-[#0F172A]/60">
                            Overview, activación, marketplace, operaciones, monetización y calidad/riesgo en una vista dedicada.
                        </p>
                    </div>
                    <Button asChild>
                        <Link to={analytics.callToActionHref}>
                            Ver analítica completa
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </AnalyticsSectionCard>
        </section>
    );
};

export default AdminPlatformAnalyticsHomeSection;
