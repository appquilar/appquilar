import { useEffect, useMemo, useState } from "react";
import {
    ArrowUpDown,
    BarChart3,
    ExternalLink,
    Eye,
    MessageCircle,
    MessagesSquare,
} from "lucide-react";

import { useUserEngagementStats } from "@/application/hooks/useUserEngagementStats";
import DashboardSectionHeader from "@/components/dashboard/common/DashboardSectionHeader";
import EngagementLineChart from "@/components/dashboard/stats/EngagementLineChart";
import { StatsDateRangeToolbar } from "@/components/dashboard/stats/StatsDateRangeToolbar";
import { normalizeEngagementSeries } from "@/components/dashboard/stats/engagementStatsUtils";
import { buildProductPath } from "@/domain/config/publicRoutes";
import { useStatsDateRange } from "@/hooks/useStatsDateRange";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    | "messageThreads";

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
    messageThreads: number;
};

interface AdminUserStatsSectionProps {
    userId: string;
    userLabel?: string;
}

const PRODUCT_BREAKDOWN_PAGE_SIZE = 8;

export const AdminUserStatsSection = ({
    userId,
    userLabel,
}: AdminUserStatsSectionProps) => {
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

    const userStatsQuery = useUserEngagementStats(userId, period);

    const isLoading = userStatsQuery.isLoading;
    const error = userStatsQuery.error;

    const viewsChartData = useMemo(
        () =>
            normalizeEngagementSeries(
                range,
                (userStatsQuery.data?.dailyViews ?? []).map((row) => ({
                    day: row.day,
                    value: row.views,
                }))
            ),
        [range, userStatsQuery.data?.dailyViews]
    );
    const messagesChartData = useMemo(
        () =>
            normalizeEngagementSeries(
                range,
                (userStatsQuery.data?.dailyMessages ?? []).map((row) => ({
                    day: row.day,
                    value: row.messages,
                }))
            ),
        [range, userStatsQuery.data?.dailyMessages]
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
        return (userStatsQuery.data?.byProduct ?? []).map((row) => {
            return {
                productId: row.productId,
                productName: row.productName,
                productSlug: (row.productSlug ?? "").trim(),
                productInternalId: (row.productInternalId ?? "").trim(),
                totalViews: row.totalViews,
                uniqueVisitors: row.uniqueVisitors,
                messagesTotal: row.messagesTotal,
                messageThreads: row.messageThreads,
            };
        });
    }, [userStatsQuery.data?.byProduct]);

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

    const description = userLabel
        ? `Como admin estás viendo el rendimiento real de ${userLabel}.`
        : "Como admin estás viendo el rendimiento real del usuario seleccionado.";

    return (
        <section className="space-y-4">
            <DashboardSectionHeader
                title="Estadísticas de usuario"
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
                        Error al cargar las métricas del usuario seleccionado.
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
                                    {isLoading ? "..." : userStatsQuery.data?.summary.uniqueVisitors ?? 0}
                                </div>
                                <p className="text-xs text-[#0F172A]/55">Usuarios únicos en el rango</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-[#0F172A]">Visitas totales</CardTitle>
                                <BarChart3 className="h-4 w-4 text-[#F19D70]" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {isLoading ? "..." : userStatsQuery.data?.summary.totalViews ?? 0}
                                </div>
                                <p className="text-xs text-[#0F172A]/55">Actividad agregada en fichas</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-[#0F172A]">Mensajes</CardTitle>
                                <MessageCircle className="h-4 w-4 text-[#F19D70]" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {isLoading ? "..." : userStatsQuery.data?.summary.messagesTotal ?? 0}
                                </div>
                                <p className="text-xs text-[#0F172A]/55">Mensajes generados en el rango</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-[#0F172A]">Conversaciones</CardTitle>
                                <MessagesSquare className="h-4 w-4 text-[#F19D70]" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {isLoading ? "..." : userStatsQuery.data?.summary.messageThreads ?? 0}
                                </div>
                                <p className="text-xs text-[#0F172A]/55">Hilos iniciados en el rango</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                        <Card className="w-full overflow-hidden">
                            <CardHeader>
                                <CardTitle>Visitas diarias</CardTitle>
                                <CardDescription>Evolución del tráfico sobre los productos del usuario.</CardDescription>
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
                                <CardDescription>Evolución de los mensajes asociados a sus productos.</CardDescription>
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

                    <Card className="overflow-hidden">
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
                            <Table className="min-w-[720px]">
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
                                            <button type="button" className={sortHeaderClass("messageThreads")} onClick={() => toggleProductSort("messageThreads")}>
                                                Conversaciones
                                                <ArrowUpDown className="h-3.5 w-3.5" />
                                            </button>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!isLoading && filteredBreakdownRows.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-[#0F172A]/55">
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
                                            <TableCell>{product.messageThreads}</TableCell>
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
                </>
            )}
        </section>
    );
};
