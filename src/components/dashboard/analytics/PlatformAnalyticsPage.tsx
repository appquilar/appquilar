import { BarChart3 } from "lucide-react";

import { useAdminPlatformAnalytics } from "@/application/hooks/useAdminPlatformAnalytics";
import DashboardSectionHeader from "@/components/dashboard/common/DashboardSectionHeader";
import EngagementLineChart from "@/components/dashboard/stats/EngagementLineChart";
import { StatsDateRangeToolbar } from "@/components/dashboard/stats/StatsDateRangeToolbar";
import {
    AnalyticsCategoryTable,
    AnalyticsEmptyState,
    AnalyticsInsightList,
    AnalyticsLinkList,
    AnalyticsMetricCard,
    AnalyticsPlanDistributionTable,
    AnalyticsRankingList,
    AnalyticsSectionCard,
    AnalyticsSeriesPlaceholder,
    AnalyticsUnsupportedList,
    AnalyticsUsageList,
} from "@/components/dashboard/analytics/platformAnalyticsUi";
import { formatDemandOfferRatio } from "@/components/dashboard/analytics/platformAnalyticsFormat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStatsDateRange } from "@/hooks/useStatsDateRange";
import type { PlatformActivationStep, PlatformCategoryBreakdown } from "@/domain/models/AdminPlatformAnalytics";

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
                title="Sin señales destacables"
                description="No hay suficiente variación para destacar categorías en este bloque."
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
                                <p className="text-sm font-semibold text-[#0F172A]">{row.categoryName}</p>
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

const ActivationTable = ({ steps }: { steps: PlatformActivationStep[] }) => (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80">
        <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.12em] text-[#0F172A]/55">
                <tr>
                    <th className="px-4 py-3 font-medium">Fase</th>
                    <th className="px-4 py-3 font-medium">Actual</th>
                    <th className="px-4 py-3 font-medium">Share</th>
                    <th className="px-4 py-3 font-medium">Conv. paso previo</th>
                    <th className="px-4 py-3 font-medium">Drop-off</th>
                </tr>
            </thead>
            <tbody>
                {steps.map((step) => (
                    <tr key={step.key} className="border-t border-slate-200/80 bg-white">
                        <td className="px-4 py-3">
                            <div>
                                <p className="font-medium text-[#0F172A]">{step.label}</p>
                                {step.availability?.reason ? (
                                    <p className="text-xs text-[#0F172A]/45">{step.availability.reason}</p>
                                ) : null}
                            </div>
                        </td>
                        <td className="px-4 py-3 text-[#0F172A]">{step.value}</td>
                        <td className="px-4 py-3 text-[#0F172A]/70">
                            {(step.shareOfFirstStep * 100).toFixed(1)}%
                        </td>
                        <td className="px-4 py-3 text-[#0F172A]/70">
                            {step.conversionFromPrevious == null
                                ? "No aplica"
                                : `${(step.conversionFromPrevious * 100).toFixed(1)}%`}
                        </td>
                        <td className="px-4 py-3 text-[#0F172A]/70">
                            {step.dropOffFromPrevious == null
                                ? "No aplica"
                                : `${(step.dropOffFromPrevious * 100).toFixed(1)}%`}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const PlatformAnalyticsPage = () => {
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
    const analyticsQuery = useAdminPlatformAnalytics(period);

    if (analyticsQuery.isLoading) {
        return (
            <div className="space-y-4">
                <DashboardSectionHeader
                    title="Analítica de plataforma"
                    description="Cargando métricas internas para admins."
                    icon={BarChart3}
                />
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div
                            key={`platform-analytics-page-skeleton-${index}`}
                            className="h-44 animate-pulse rounded-2xl border border-slate-200/80 bg-slate-100/80"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (analyticsQuery.isError || !analyticsQuery.data) {
        return (
            <div className="space-y-4">
                <DashboardSectionHeader
                    title="Analítica de plataforma"
                    description="No se pudo cargar la analítica interna."
                    icon={BarChart3}
                />
                <AnalyticsEmptyState
                    title="No disponible"
                    description="La vista de detalle no está disponible ahora mismo. Reintenta en unos segundos."
                />
            </div>
        );
    }

    const analytics = analyticsQuery.data;
    const hasViewsSeries = analytics.overview.dailyViews.some((point) => point.value > 0);
    const hasMessagesSeries = analytics.overview.dailyMessages.some((point) => point.value > 0);

    return (
        <div className="space-y-6">
            <div className="grid gap-3 xl:grid-cols-[1fr_auto] xl:items-end">
                <DashboardSectionHeader
                    title="Analítica de plataforma"
                    description="Capa interna para admins con overview, activación, marketplace, operaciones, monetización y calidad. Sólo mostramos datos globales que hoy podemos enseñar con fiabilidad."
                    icon={BarChart3}
                />
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
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 rounded-2xl border border-slate-200/80 bg-white p-2 text-[#0F172A]/70">
                    <TabsTrigger value="overview" className="rounded-xl">Overview</TabsTrigger>
                    <TabsTrigger value="activation" className="rounded-xl">Activación</TabsTrigger>
                    <TabsTrigger value="marketplace" className="rounded-xl">Marketplace</TabsTrigger>
                    <TabsTrigger value="operations" className="rounded-xl">Operaciones</TabsTrigger>
                    <TabsTrigger value="monetization" className="rounded-xl">Monetización</TabsTrigger>
                    <TabsTrigger value="quality" className="rounded-xl">Calidad y riesgo</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <AnalyticsSectionCard
                        title="Overview"
                        description="Foto general de actividad, catálogo, conversación y distribución de planes activos."
                    >
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                            {analytics.overview.cards.map((card) => (
                                <AnalyticsMetricCard key={card.key} card={card} />
                            ))}
                        </div>
                    </AnalyticsSectionCard>

                    <div className="grid gap-4 xl:grid-cols-2">
                        <AnalyticsSectionCard
                            title="Distribución de planes"
                            description="Desglose actual entre cuentas company y usuarios directos."
                        >
                            <AnalyticsPlanDistributionTable items={analytics.overview.planDistribution} />
                        </AnalyticsSectionCard>

                        <AnalyticsSectionCard
                            title="Insights rápidos"
                            description="Mismas señales de homepage, visibles también aquí para contexto."
                        >
                            <AnalyticsInsightList insights={analytics.homepage.insights} />
                        </AnalyticsSectionCard>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-2">
                        {hasViewsSeries ? (
                            <AnalyticsSectionCard
                                title="Visitas diarias"
                                description="Serie agregada de views dentro del rango seleccionado."
                            >
                                <div className="h-[260px]">
                                    <EngagementLineChart
                                        data={analytics.overview.dailyViews.map((point) => ({
                                            day: point.day.slice(5),
                                            value: point.value,
                                        }))}
                                        color="#94A3B8"
                                        label="Visitas"
                                    />
                                </div>
                            </AnalyticsSectionCard>
                        ) : (
                            <AnalyticsSeriesPlaceholder
                                title="Sin serie de visitas"
                                description="No hay suficiente actividad para pintar una tendencia útil."
                            />
                        )}

                        {hasMessagesSeries ? (
                            <AnalyticsSectionCard
                                title="Conversaciones diarias"
                                description="Serie agregada de mensajes del rango seleccionado."
                            >
                                <div className="h-[260px]">
                                    <EngagementLineChart
                                        data={analytics.overview.dailyMessages.map((point) => ({
                                            day: point.day.slice(5),
                                            value: point.value,
                                        }))}
                                        color="#F19D70"
                                        label="Mensajes"
                                    />
                                </div>
                            </AnalyticsSectionCard>
                        ) : (
                            <AnalyticsSeriesPlaceholder
                                title="Sin serie de conversaciones"
                                description="Todavía no hay suficiente actividad diaria agregada."
                            />
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="activation" className="space-y-4">
                    <AnalyticsSectionCard
                        title="Embudo de activación soportado"
                        description="Fases disponibles sin inferir eventos que todavía no medimos con suficiente fiabilidad."
                    >
                        <ActivationTable steps={analytics.activation.steps} />
                    </AnalyticsSectionCard>

                    <div className="grid gap-4 xl:grid-cols-2">
                        <AnalyticsSectionCard
                            title="Lectura del funnel"
                            description="Notas importantes sobre cobertura y limitaciones del backend."
                        >
                            <div className="space-y-3">
                                {analytics.activation.notes.map((note) => (
                                    <div
                                        key={note}
                                        className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-[#0F172A]/60"
                                    >
                                        {note}
                                    </div>
                                ))}
                            </div>
                        </AnalyticsSectionCard>

                        <AnalyticsSectionCard
                            title="Qué no entra todavía"
                            description="Esta iteración deja fuera fases para las que todavía no tenemos señal global fiable."
                        >
                            <AnalyticsEmptyState
                                title="Sin cohortes ni tiempos a primer evento"
                                description="No se muestran tiempos hasta primer producto, primera conversación, primer alquiler o upgrade, ni cohortes de activación, porque todavía no tenemos ese nivel de detalle global con suficiente fiabilidad."
                                compact
                            />
                        </AnalyticsSectionCard>
                    </div>
                </TabsContent>

                <TabsContent value="marketplace" className="space-y-4">
                    <div className="grid gap-4 xl:grid-cols-2">
                        <AnalyticsSectionCard
                            title="Oferta y demanda por categoría"
                            description="Breakdown principal del marketplace basado en catálogo publicado y conversaciones."
                        >
                            <AnalyticsCategoryTable
                                rows={analytics.marketplace.categories}
                                emptyTitle="Sin actividad por categoría"
                                emptyDescription="Todavía no hay suficiente mezcla de catálogo y conversación para construir el breakdown."
                            />
                        </AnalyticsSectionCard>

                        <AnalyticsSectionCard
                            title="Pendiente de cobertura"
                            description="Zonas, tráfico y búsquedas aparecerán cuando tengamos datos globales suficientemente fiables."
                        >
                            <AnalyticsUnsupportedList items={analytics.marketplace.unsupportedSections} />
                        </AnalyticsSectionCard>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-2">
                        <CategorySignalList
                            title="Categorías en crecimiento"
                            description="Suben en conversaciones frente al período anterior."
                            rows={analytics.marketplace.growthCategories}
                        />
                        <CategorySignalList
                            title="Categorías débiles o saturadas"
                            description="Oferta relativamente alta con demanda insuficiente."
                            rows={analytics.marketplace.weakCategories}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="operations" className="space-y-4">
                    <AnalyticsSectionCard
                        title="KPIs operativos"
                        description="Métricas de respuesta disponibles en modo ligero y estricto."
                    >
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {analytics.operations.cards.map((card) => (
                                <AnalyticsMetricCard key={card.key} card={card} />
                            ))}
                        </div>
                    </AnalyticsSectionCard>

                    <div className="grid gap-4 xl:grid-cols-2">
                        <AnalyticsSectionCard
                            title="Mejor performance"
                            description="Empresas con menor tiempo medio de primera respuesta."
                        >
                            <AnalyticsRankingList
                                items={analytics.operations.bestResponders}
                                format="duration_minutes"
                                emptyTitle="Sin mejores performers"
                                emptyDescription="No hay suficientes empresas con dato de respuesta para construir el ranking."
                            />
                        </AnalyticsSectionCard>

                        <AnalyticsSectionCard
                            title="Peor performance"
                            description="Empresas con mayor tiempo medio de primera respuesta."
                        >
                            <AnalyticsRankingList
                                items={analytics.operations.slowResponders}
                                format="duration_minutes"
                                emptyTitle="Sin alertas de SLA"
                                emptyDescription="No hay suficientes empresas con dato de respuesta para construir el ranking."
                            />
                        </AnalyticsSectionCard>
                    </div>

                    {analytics.operations.dailyMessages.some((point) => point.value > 0) ? (
                        <AnalyticsSectionCard
                            title="Evolución diaria"
                            description="Serie diaria agregada de conversaciones del período."
                        >
                            <div className="h-[280px]">
                                <EngagementLineChart
                                    data={analytics.operations.dailyMessages.map((point) => ({
                                        day: point.day.slice(5),
                                        value: point.value,
                                    }))}
                                    color="#F19D70"
                                    label="Mensajes"
                                />
                            </div>
                        </AnalyticsSectionCard>
                    ) : (
                        <AnalyticsSeriesPlaceholder
                            title="Sin evolución diaria"
                            description="No hay suficiente actividad diaria para una serie operativa útil."
                        />
                    )}
                </TabsContent>

                <TabsContent value="monetization" className="space-y-4">
                    <AnalyticsSectionCard
                        title="KPIs de monetización"
                        description="Distribución actual entre free y paid, sin inventar histórico financiero."
                    >
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {analytics.monetization.cards.map((card) => (
                                <AnalyticsMetricCard key={card.key} card={card} />
                            ))}
                        </div>
                    </AnalyticsSectionCard>

                    <div className="grid gap-4 xl:grid-cols-2">
                        <AnalyticsSectionCard
                            title="Distribución por plan"
                            description="Foto actual de planes company y cuentas directas."
                        >
                            <AnalyticsPlanDistributionTable items={analytics.monetization.planDistribution} />
                        </AnalyticsSectionCard>

                        <AnalyticsSectionCard
                            title="Candidatas a upgrade"
                            description="Cuentas con señales de uso suficientes para revisión comercial."
                        >
                            <AnalyticsLinkList
                                items={analytics.monetization.upgradeCandidates}
                                emptyTitle="Sin candidatas claras"
                                emptyDescription="No hay cuentas que destaquen por tracción suficiente para upgrade ahora mismo."
                            />
                        </AnalyticsSectionCard>
                    </div>

                    <AnalyticsSectionCard
                        title="Uso de capacidad del plan"
                        description="Cuentas que se acercan al límite de catálogo permitido."
                    >
                        <AnalyticsUsageList
                            items={analytics.monetization.nearLimitAccounts}
                            emptyTitle="Sin cuentas cerca del límite"
                            emptyDescription="No hay cuentas usando al menos el 80% de su capacidad actual."
                        />
                    </AnalyticsSectionCard>
                </TabsContent>

                <TabsContent value="quality" className="space-y-4">
                    <AnalyticsSectionCard
                        title="KPIs de calidad y riesgo"
                        description="Foto actual de catálogo incompleto, cuentas dormidas y foco manual."
                    >
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {analytics.qualityRisk.cards.map((card) => (
                                <AnalyticsMetricCard key={card.key} card={card} />
                            ))}
                        </div>
                    </AnalyticsSectionCard>

                    <div className="grid gap-4 xl:grid-cols-2">
                        <AnalyticsSectionCard
                            title="Productos sin imagen"
                            description="Catálogo publicado que requiere enriquecimiento visual."
                        >
                            <AnalyticsLinkList
                                items={analytics.qualityRisk.productsWithoutImage}
                                emptyTitle="Sin productos sin imagen"
                                emptyDescription="El catálogo publicado cargado no muestra incidencias visuales ahora mismo."
                            />
                        </AnalyticsSectionCard>

                        <AnalyticsSectionCard
                            title="Productos sin precio válido"
                            description="Productos publicados sin tier o daily price usable."
                        >
                            <AnalyticsLinkList
                                items={analytics.qualityRisk.productsWithoutPrice}
                                emptyTitle="Sin incidencias de precio"
                                emptyDescription="No hay productos publicados sin precio diario válido."
                            />
                        </AnalyticsSectionCard>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-2">
                        <AnalyticsSectionCard
                            title="Empresas dormidas"
                            description="Catálogo publicado pero sin visitas ni conversaciones en el período."
                        >
                            <AnalyticsLinkList
                                items={analytics.qualityRisk.dormantCompanies}
                                emptyTitle="Sin empresas dormidas"
                                emptyDescription="No hay empresas con catálogo publicado y actividad totalmente nula en el período."
                            />
                        </AnalyticsSectionCard>

                        <AnalyticsSectionCard
                            title="Cuentas que requieren acción"
                            description="Lista priorizada para seguimiento operativo manual."
                        >
                            <AnalyticsLinkList
                                items={analytics.qualityRisk.actionItems}
                                emptyTitle="Sin cuentas en foco"
                                emptyDescription="No hay cuentas o productos que requieran una acción inmediata clara."
                            />
                        </AnalyticsSectionCard>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default PlatformAnalyticsPage;
