import { useEffect, useMemo, useState } from "react";
import {
    ArrowUpDown,
    BarChart3,
    ExternalLink,
    Eye,
    MapPinned,
    MessageCircle,
    Repeat,
    Timer,
} from "lucide-react";

import { useCompanyEngagementStats } from "@/application/hooks/useCompanyEngagementStats";
import DashboardSectionHeader from "@/components/dashboard/common/DashboardSectionHeader";
import EngagementLineChart from "@/components/dashboard/stats/EngagementLineChart";
import { CompanyAdvancedStatsPremium } from "@/components/dashboard/stats/CompanyAdvancedStatsPremium";
import { StatsDateRangeToolbar } from "@/components/dashboard/stats/StatsDateRangeToolbar";
import {
    formatEngagementPercent,
    normalizeEngagementSeries,
} from "@/components/dashboard/stats/engagementStatsUtils";
import { buildProductPath } from "@/domain/config/publicRoutes";
import { useStatsDateRange } from "@/hooks/useStatsDateRange";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type ProductSortField =
    | "productName"
    | "totalViews"
    | "uniqueVisitors"
    | "messagesTotal"
    | "loggedViews"
    | "anonymousViews"
    | "visitToMessageRatio"
    | "messageToRentalRatio";

type ProductSortDirection = "asc" | "desc";

type ProductSortState = {
    field: ProductSortField;
    direction: ProductSortDirection;
};

type ProductBreakdownRow = {
    productId: string;
    productName: string;
    productSlug: string;
    productInternalId: string;
    totalViews: number;
    uniqueVisitors: number;
    messagesTotal: number;
    loggedViews: number;
    anonymousViews: number;
    visitToMessageRatio: number;
    messageToRentalRatio: number;
};

interface AdminCompanyStatsSectionProps {
    companyId: string;
    companyName?: string | null;
}

const PRODUCT_BREAKDOWN_PAGE_SIZE = 8;

export const AdminCompanyStatsSection = ({
    companyId,
    companyName,
}: AdminCompanyStatsSectionProps) => {
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

    const [productSort, setProductSort] = useState<ProductSortState>({
        field: "uniqueVisitors",
        direction: "desc",
    });
    const [productSearch, setProductSearch] = useState("");
    const [productPage, setProductPage] = useState(1);

    const companyStatsQuery = useCompanyEngagementStats(companyId, period);

    const isLoading = companyStatsQuery.isLoading;
    const error = companyStatsQuery.error;

    const viewsChartData = useMemo(
        () =>
            normalizeEngagementSeries(
                range,
                (companyStatsQuery.data?.dailyViews ?? []).map((row) => ({
                    day: row.day,
                    value: row.views,
                }))
            ),
        [companyStatsQuery.data?.dailyViews, range]
    );
    const messagesChartData = useMemo(
        () =>
            normalizeEngagementSeries(
                range,
                (companyStatsQuery.data?.dailyMessages ?? []).map((row) => ({
                    day: row.day,
                    value: row.messages,
                }))
            ),
        [companyStatsQuery.data?.dailyMessages, range]
    );
    const hasViewsChartData = useMemo(
        () => viewsChartData.some((point) => point.value > 0),
        [viewsChartData]
    );
    const hasMessagesChartData = useMemo(
        () => messagesChartData.some((point) => point.value > 0),
        [messagesChartData]
    );

    const breakdownRows = useMemo<ProductBreakdownRow[]>(() => {
        return (companyStatsQuery.data?.byProduct ?? []).map((row) => {
            return {
                productId: row.productId,
                productName: row.productName,
                productSlug: (row.productSlug ?? "").trim(),
                productInternalId: (row.productInternalId ?? "").trim(),
                totalViews: row.totalViews,
                uniqueVisitors: row.uniqueVisitors,
                messagesTotal: row.messagesTotal,
                loggedViews: row.loggedViews,
                anonymousViews: row.anonymousViews,
                visitToMessageRatio: row.visitToMessageRatio,
                messageToRentalRatio: row.messageToRentalRatio,
            };
        });
    }, [companyStatsQuery.data?.byProduct]);

    const sortedBreakdownRows = useMemo(() => {
        const rows = [...breakdownRows];
        const factor = productSort.direction === "asc" ? 1 : -1;

        rows.sort((left, right) => {
            if (productSort.field === "productName") {
                return left.productName.localeCompare(right.productName, "es", { sensitivity: "base" }) * factor;
            }

            return ((left[productSort.field] as number) - (right[productSort.field] as number)) * factor;
        });

        return rows;
    }, [breakdownRows, productSort]);

    const filteredBreakdownRows = useMemo(() => {
        const needle = productSearch.trim().toLowerCase();
        if (needle === "") {
            return sortedBreakdownRows;
        }

        return sortedBreakdownRows.filter((row) => {
            const nameMatch = row.productName.toLowerCase().includes(needle);
            const internalIdMatch = row.productInternalId.toLowerCase().includes(needle);
            return nameMatch || internalIdMatch;
        });
    }, [productSearch, sortedBreakdownRows]);

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(filteredBreakdownRows.length / PRODUCT_BREAKDOWN_PAGE_SIZE)),
        [filteredBreakdownRows.length]
    );
    const paginatedRows = useMemo(() => {
        const start = (productPage - 1) * PRODUCT_BREAKDOWN_PAGE_SIZE;
        return filteredBreakdownRows.slice(start, start + PRODUCT_BREAKDOWN_PAGE_SIZE);
    }, [filteredBreakdownRows, productPage]);

    useEffect(() => {
        setProductPage(1);
    }, [period?.from, period?.to]);

    useEffect(() => {
        if (productPage > totalPages) {
            setProductPage(totalPages);
        }
    }, [productPage, totalPages]);

    const toggleProductSort = (field: ProductSortField) => {
        setProductPage(1);
        setProductSort((current) => {
            if (current.field === field) {
                return {
                    field,
                    direction: current.direction === "asc" ? "desc" : "asc",
                };
            }

            return {
                field,
                direction: field === "productName" ? "asc" : "desc",
            };
        });
    };

    const sortHeaderClass = (field: ProductSortField): string =>
        `inline-flex items-center gap-1.5 transition-colors ${
            productSort.field === field ? "text-[#C86A35]" : "text-[#0F172A]"
        }`;

    const description = companyName
        ? `Como admin estás viendo las métricas reales de ${companyName} con el rango seleccionado.`
        : "Como admin estás viendo las métricas reales de esta empresa con el rango seleccionado.";

    return (
        <section className="space-y-4">
            <DashboardSectionHeader
                title="Estadísticas de empresa"
                description={description}
                icon={BarChart3}
                actions={
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
                }
            />

            {error && (
                <Card>
                    <CardContent className="py-6 text-sm text-destructive">
                        Error al cargar las métricas de la empresa seleccionada.
                    </CardContent>
                </Card>
            )}

            {!error && (
                <>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-[#0F172A]">Visitas únicas</CardTitle>
                                <Eye className="h-4 w-4 text-[#F19D70]" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {isLoading ? "..." : companyStatsQuery.data?.summary.uniqueVisitors ?? 0}
                                </div>
                                <p className="text-xs text-[#0F172A]/55">
                                    {isLoading ? "..." : `${companyStatsQuery.data?.summary.totalViews ?? 0} visitas totales`}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-[#0F172A]">Mensajes</CardTitle>
                                <MessageCircle className="h-4 w-4 text-[#F19D70]" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {isLoading ? "..." : companyStatsQuery.data?.summary.messagesTotal ?? 0}
                                </div>
                                <p className="text-xs text-[#0F172A]/55">
                                    {isLoading ? "..." : `${companyStatsQuery.data?.summary.messageThreads ?? 0} conversaciones`}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-[#0F172A]">Repetición de visitantes</CardTitle>
                                <Repeat className="h-4 w-4 text-[#F19D70]" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {isLoading ? "..." : formatEngagementPercent(companyStatsQuery.data?.summary.repeatVisitorRatio ?? 0)}
                                </div>
                                <p className="text-xs text-[#0F172A]/55">
                                    {isLoading ? "..." : `${companyStatsQuery.data?.summary.repeatVisitors ?? 0} visitantes recurrentes`}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-[#0F172A]">1ª respuesta media</CardTitle>
                                <Timer className="h-4 w-4 text-[#F19D70]" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {isLoading
                                        ? "..."
                                        : companyStatsQuery.data?.summary.averageFirstResponseMinutes != null
                                            ? `${companyStatsQuery.data.summary.averageFirstResponseMinutes} min`
                                            : "N/D"}
                                </div>
                                <p className="text-xs text-[#0F172A]/55">
                                    Ratio mensaje a alquiler:{" "}
                                    {isLoading ? "..." : formatEngagementPercent(companyStatsQuery.data?.summary.messageToRentalRatio ?? 0)}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <CompanyAdvancedStatsPremium
                        companyId={companyId}
                        period={period}
                        hasAccess={true}
                    />

                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                        <Card className="w-full overflow-hidden">
                            <CardHeader>
                                <CardTitle>Visitas diarias</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 h-[320px] sm:h-[380px]">
                                {!isLoading && !hasViewsChartData ? (
                                    <div className="flex h-full items-center justify-center p-6">
                                        <div className="rounded-xl border border-slate-200 bg-white/90 px-5 py-3 text-sm font-medium text-[#0F172A]/60 shadow-sm">
                                            Sin datos que mostrar
                                        </div>
                                    </div>
                                ) : (
                                    <EngagementLineChart
                                        data={viewsChartData}
                                        color="#F19D70"
                                        label="Visitas"
                                    />
                                )}
                            </CardContent>
                        </Card>

                        <Card className="w-full overflow-hidden">
                            <CardHeader>
                                <CardTitle>Mensajes diarios</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 h-[320px] sm:h-[380px]">
                                {!isLoading && !hasMessagesChartData ? (
                                    <div className="flex h-full items-center justify-center p-6">
                                        <div className="rounded-xl border border-slate-200 bg-white/90 px-5 py-3 text-sm font-medium text-[#0F172A]/60 shadow-sm">
                                            Sin datos que mostrar
                                        </div>
                                    </div>
                                ) : (
                                    <EngagementLineChart
                                        data={messagesChartData}
                                        color="#E59A73"
                                        label="Mensajes"
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
                        <Card className="xl:col-span-2 overflow-hidden">
                            <CardHeader>
                                <CardTitle>Desglose por producto</CardTitle>
                                <div className="pt-3">
                                    <Input
                                        value={productSearch}
                                        onChange={(event) => {
                                            setProductSearch(event.target.value);
                                            setProductPage(1);
                                        }}
                                        placeholder="Buscar por nombre o ID interno..."
                                        className="h-10 max-w-md bg-white"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table className="min-w-[760px]">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>
                                                <button type="button" className={sortHeaderClass("productName")} onClick={() => toggleProductSort("productName")}>
                                                    Producto
                                                    <ArrowUpDown className="h-3.5 w-3.5" />
                                                </button>
                                            </TableHead>
                                            <TableHead>
                                                <button type="button" className={sortHeaderClass("totalViews")} onClick={() => toggleProductSort("totalViews")}>
                                                    Visitas
                                                    <ArrowUpDown className="h-3.5 w-3.5" />
                                                </button>
                                            </TableHead>
                                            <TableHead>
                                                <button type="button" className={sortHeaderClass("uniqueVisitors")} onClick={() => toggleProductSort("uniqueVisitors")}>
                                                    Únicas
                                                    <ArrowUpDown className="h-3.5 w-3.5" />
                                                </button>
                                            </TableHead>
                                            <TableHead>
                                                <button type="button" className={sortHeaderClass("messagesTotal")} onClick={() => toggleProductSort("messagesTotal")}>
                                                    Mensajes
                                                    <ArrowUpDown className="h-3.5 w-3.5" />
                                                </button>
                                            </TableHead>
                                            <TableHead>
                                                <button type="button" className={sortHeaderClass("loggedViews")} onClick={() => toggleProductSort("loggedViews")}>
                                                    Logadas
                                                    <ArrowUpDown className="h-3.5 w-3.5" />
                                                </button>
                                            </TableHead>
                                            <TableHead>
                                                <button type="button" className={sortHeaderClass("anonymousViews")} onClick={() => toggleProductSort("anonymousViews")}>
                                                    No logadas
                                                    <ArrowUpDown className="h-3.5 w-3.5" />
                                                </button>
                                            </TableHead>
                                            <TableHead>
                                                <button type="button" className={sortHeaderClass("visitToMessageRatio")} onClick={() => toggleProductSort("visitToMessageRatio")}>
                                                    Visita a mensaje
                                                    <ArrowUpDown className="h-3.5 w-3.5" />
                                                </button>
                                            </TableHead>
                                            <TableHead>
                                                <button type="button" className={sortHeaderClass("messageToRentalRatio")} onClick={() => toggleProductSort("messageToRentalRatio")}>
                                                    Mensaje a alquiler
                                                    <ArrowUpDown className="h-3.5 w-3.5" />
                                                </button>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {!isLoading && filteredBreakdownRows.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center text-[#0F172A]/55">
                                                    Sin datos de productos para el período.
                                                </TableCell>
                                            </TableRow>
                                        )}

                                        {paginatedRows.map((product) => (
                                            <TableRow key={product.productId}>
                                                <TableCell className="font-medium">
                                                    <div className="min-w-0">
                                                        <a
                                                            href={product.productSlug ? buildProductPath(product.productSlug) : `/dashboard/products/${product.productId}`}
                                                            target={product.productSlug ? "_blank" : "_self"}
                                                            rel={product.productSlug ? "noopener noreferrer" : undefined}
                                                            className="inline-flex items-center gap-1 text-[#0F172A] transition-colors hover:text-[#C86A35] hover:underline"
                                                        >
                                                            <span className="truncate">{product.productName}</span>
                                                            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                                                        </a>
                                                        <p className="mt-0.5 text-xs text-[#0F172A]/45">
                                                            ID interno: {product.productInternalId || "—"}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{product.totalViews}</TableCell>
                                                <TableCell>{product.uniqueVisitors}</TableCell>
                                                <TableCell>{product.messagesTotal}</TableCell>
                                                <TableCell>{product.loggedViews}</TableCell>
                                                <TableCell>{product.anonymousViews}</TableCell>
                                                <TableCell>{formatEngagementPercent(product.visitToMessageRatio)}</TableCell>
                                                <TableCell>{formatEngagementPercent(product.messageToRentalRatio)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {filteredBreakdownRows.length > PRODUCT_BREAKDOWN_PAGE_SIZE && (
                                    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
                                        <p className="text-xs text-[#0F172A]/55">
                                            Página {productPage} de {totalPages}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setProductPage((current) => Math.max(1, current - 1))}
                                                disabled={productPage <= 1}
                                            >
                                                Anterior
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setProductPage((current) => Math.min(totalPages, current + 1))}
                                                disabled={productPage >= totalPages}
                                            >
                                                Siguiente
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPinned className="h-4 w-4 text-[#F19D70]" />
                                    Top ubicaciones
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                {!isLoading && (companyStatsQuery.data?.topLocations.length ?? 0) === 0 && (
                                    <p className="text-[#0F172A]/55">Sin ubicación disponible todavía.</p>
                                )}
                                {(companyStatsQuery.data?.topLocations ?? []).slice(0, 8).map((location, index) => (
                                    <div
                                        key={`${location.country}-${location.region}-${location.city}-${index}`}
                                        className="flex items-center justify-between gap-2"
                                    >
                                        <div className="min-w-0">
                                            <p className="font-medium truncate">
                                                {[location.city, location.region, location.country].filter(Boolean).join(", ")}
                                            </p>
                                            <p className="text-xs text-[#0F172A]/55">
                                                {location.uniqueVisitors} únicos
                                            </p>
                                        </div>
                                        <div className="text-xs font-medium">{location.totalViews}</div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {companyStatsQuery.data?.opportunities.highInterestLowConversion && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Oportunidad detectada</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-[#0F172A]/55">
                                <span className="font-medium text-foreground">
                                    {companyStatsQuery.data.opportunities.highInterestLowConversion.productName}
                                </span>{" "}
                                tiene mucho interés ({companyStatsQuery.data.opportunities.highInterestLowConversion.uniqueVisitors} visitas únicas),
                                pero una conversión baja a conversación (
                                {formatEngagementPercent(companyStatsQuery.data.opportunities.highInterestLowConversion.visitToMessageRatio)}).
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </section>
    );
};
