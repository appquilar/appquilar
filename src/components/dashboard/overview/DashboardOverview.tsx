import { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import {
    differenceInCalendarDays,
    eachDayOfInterval,
    endOfDay,
    format,
    isSameDay,
    parseISO,
    startOfDay,
    subDays,
} from "date-fns";
import { es } from "date-fns/locale";
import { CalendarRange, Eye, Home, MessageCircle, Repeat, Timer, X } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import PlanGuard from "@/components/auth/PlanGuard";
import { useAuth } from "@/context/AuthContext";
import { useCompanyEngagementStats } from "@/application/hooks/useCompanyEngagementStats";
import { useUserEngagementStats } from "@/application/hooks/useUserEngagementStats";
import { useCreateCheckoutSession } from "@/application/hooks/useBilling";
import { useActiveProductsCount } from "@/application/hooks/useProducts";
import EngagementLineChart, { EngagementLineChartPoint } from "@/components/dashboard/stats/EngagementLineChart";
import SpanishDateInput from "@/components/products/SpanishDateInput";
import { ApiError } from "@/infrastructure/http/ApiClient";
import {
    getCompanyPlanProductLimit,
    getUserPlanProductLimit,
    isCompanyAdvancedAnalyticsEnabled,
} from "@/domain/models/Subscription";
import DashboardSectionHeader from "@/components/dashboard/common/DashboardSectionHeader";

const MAX_RANGE_DAYS = 30;

const formatPercent = (value: number): string => `${(value * 100).toFixed(1)}%`;

const formatRangeLabel = (range: DateRange): string => {
    if (!range.from || !range.to) {
        return "Selecciona rango";
    }

    const fromLabel = format(range.from, "dd/MM/yyyy");
    const toLabel = format(range.to, "dd/MM/yyyy");
    return `${fromLabel} - ${toLabel}`;
};

const toIsoDateValue = (date: Date | undefined): string =>
    date ? format(date, "yyyy-MM-dd") : "";

const normalizeSeries = (
    range: DateRange,
    rows: Array<{ day: string; value: number }>
): EngagementLineChartPoint[] => {
    if (!range.from || !range.to) {
        return [];
    }

    const byDay = new Map<string, number>(
        rows.map((row) => [row.day, row.value])
    );

    return eachDayOfInterval({
        start: startOfDay(range.from),
        end: endOfDay(range.to),
    }).map((day) => {
        const isoDay = format(day, "yyyy-MM-dd");
        return {
            day: format(day, "dd/MM"),
            value: byDay.get(isoDay) ?? 0,
        };
    });
};

const explorerPreviewViews: EngagementLineChartPoint[] = [
    { day: "01/02", value: 18 },
    { day: "05/02", value: 22 },
    { day: "09/02", value: 16 },
    { day: "13/02", value: 30 },
    { day: "17/02", value: 27 },
    { day: "21/02", value: 34 },
    { day: "25/02", value: 28 },
];

const explorerPreviewMessages: EngagementLineChartPoint[] = [
    { day: "01/02", value: 4 },
    { day: "05/02", value: 6 },
    { day: "09/02", value: 5 },
    { day: "13/02", value: 8 },
    { day: "17/02", value: 7 },
    { day: "21/02", value: 10 },
    { day: "25/02", value: 9 },
];

const DashboardOverview = () => {
    const { currentUser } = useAuth();
    const companyContext = currentUser?.companyContext ?? null;
    const companyId = companyContext?.companyId ?? currentUser?.companyId ?? null;
    const userId = currentUser?.id ?? null;
    const userPlan = currentUser?.planType ?? "explorer";
    const isCompanyScope = Boolean(companyId);
    const isUserProScope = !isCompanyScope && userPlan === "user_pro";
    const isExplorerScope = !isCompanyScope && !isUserProScope;
    const isAdvancedCompanyAnalytics = isCompanyAdvancedAnalyticsEnabled(companyContext);

    const ownerId = companyId ?? userId;
    const ownerType = companyId ? "company" : "user";

    const slotLimit = companyId
        ? getCompanyPlanProductLimit(companyContext)
        : getUserPlanProductLimit(userPlan);
    const createCheckoutMutation = useCreateCheckoutSession();
    const activeProductsCountQuery = useActiveProductsCount({
        ownerId,
        ownerType,
    });

    const today = useMemo(() => startOfDay(new Date()), []);
    const defaultFrom = useMemo(() => subDays(today, MAX_RANGE_DAYS - 1), [today]);

    const [range, setRange] = useState<DateRange>({
        from: defaultFrom,
        to: today,
    });
    const [rangeError, setRangeError] = useState<string | null>(null);
    const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);

    const period = useMemo(() => {
        if (!range.from || !range.to) {
            return undefined;
        }

        return {
            from: format(range.from, "yyyy-MM-dd"),
            to: format(range.to, "yyyy-MM-dd"),
        };
    }, [range.from, range.to]);

    const companyStatsQuery = useCompanyEngagementStats(companyId, period);
    const userStatsQuery = useUserEngagementStats(
        isUserProScope ? userId : null,
        period
    );

    const isLoading = isCompanyScope
        ? companyStatsQuery.isLoading
        : isUserProScope
            ? userStatsQuery.isLoading
            : false;

    const error = isCompanyScope ? companyStatsQuery.error : userStatsQuery.error;

    const viewsChartData = useMemo(() => {
        if (isCompanyScope) {
            return normalizeSeries(
                range,
                (companyStatsQuery.data?.dailyViews ?? []).map((row) => ({
                    day: row.day,
                    value: row.views,
                }))
            );
        }

        return normalizeSeries(
            range,
            (userStatsQuery.data?.dailyViews ?? []).map((row) => ({
                day: row.day,
                value: row.views,
            }))
        );
    }, [range, isCompanyScope, companyStatsQuery.data?.dailyViews, userStatsQuery.data?.dailyViews]);

    const messagesChartData = useMemo(() => {
        if (isCompanyScope) {
            return normalizeSeries(
                range,
                (companyStatsQuery.data?.dailyMessages ?? []).map((row) => ({
                    day: row.day,
                    value: row.messages,
                }))
            );
        }

        return normalizeSeries(
            range,
            (userStatsQuery.data?.dailyMessages ?? []).map((row) => ({
                day: row.day,
                value: row.messages,
            }))
        );
    }, [range, isCompanyScope, companyStatsQuery.data?.dailyMessages, userStatsQuery.data?.dailyMessages]);

    const handleRangeChange = (next: DateRange | undefined) => {
        if (!next?.from) {
            return;
        }

        if (!next.to) {
            setRange({ from: next.from, to: next.from });
            setRangeError(null);
            return;
        }

        const length = differenceInCalendarDays(next.to, next.from) + 1;
        if (length > MAX_RANGE_DAYS) {
            setRangeError(`El rango máximo es de ${MAX_RANGE_DAYS} días.`);
            return;
        }

        setRange({
            from: startOfDay(next.from),
            to: startOfDay(next.to),
        });
        setRangeError(null);
    };

    const applyLastDays = (days: number) => {
        const to = today;
        const from = subDays(to, days - 1);
        setRange({ from, to });
        setRangeError(null);
    };

    const selectedRangeDays = range.from && range.to
        ? differenceInCalendarDays(range.to, range.from) + 1
        : 0;

    const isPresetRange = (days: number): boolean =>
        Boolean(range.from && range.to && selectedRangeDays === days && isSameDay(range.to, today));

    const updateFromIsoDate = (nextIsoDate: string) => {
        if (!nextIsoDate) {
            return;
        }

        const nextFrom = startOfDay(parseISO(nextIsoDate));
        const nextTo = range.to && range.to >= nextFrom ? range.to : nextFrom;
        handleRangeChange({ from: nextFrom, to: nextTo });
    };

    const updateToIsoDate = (nextIsoDate: string) => {
        if (!nextIsoDate) {
            return;
        }

        const nextTo = startOfDay(parseISO(nextIsoDate));
        const nextFrom = range.from && range.from <= nextTo ? range.from : nextTo;
        handleRangeChange({ from: nextFrom, to: nextTo });
    };

    const currentUrl = typeof window !== "undefined" ? window.location.href : "";
    const handleUpgradeToUserPro = async () => {
        try {
            const response = await createCheckoutMutation.mutateAsync({
                scope: "user",
                planType: "user_pro",
                successUrl: currentUrl,
                cancelUrl: currentUrl,
            });

            window.location.assign(response.url);
        } catch (error) {
            const backendError = extractBackendErrorMessage(error);
            toast.error(
                backendError ?? "No se pudo iniciar el checkout para User Pro."
            );
        }
    };

    const overviewTitle = isCompanyScope ? "Rendimiento global y equipo" : "Mis productos";
    const slotUsageText = slotLimit == null
        ? `${activeProductsCountQuery.data ?? 0} productos activos (sin límite)`
        : `${activeProductsCountQuery.data ?? 0} de ${slotLimit} productos activos usados`;

    return (
        <div className="space-y-6">
            <div className="grid gap-3 xl:grid-cols-[1fr_auto] xl:items-end">
                <DashboardSectionHeader
                    title="Resumen"
                    description={overviewTitle}
                    icon={Home}
                />
                {!isExplorerScope && (
                    <div className="dashboard-toolbar rounded-xl border border-slate-200/80 bg-white/80 p-2.5 shadow-sm backdrop-blur-md">
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className={`border-slate-200 bg-white px-4 ${isPresetRange(7) ? "border-[#F19D70]/50 bg-[#F19D70]/10 text-[#C86A35]" : ""}`}
                                onClick={() => applyLastDays(7)}
                            >
                                7D
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className={`border-slate-200 bg-white px-4 ${isPresetRange(30) ? "border-[#F19D70]/50 bg-[#F19D70]/10 text-[#C86A35]" : ""}`}
                                onClick={() => applyLastDays(30)}
                            >
                                30D
                            </Button>
                            <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-slate-200 bg-white px-4 text-[#0F172A] hover:bg-slate-50"
                                    >
                                        <CalendarRange className="h-4 w-4 text-[#F19D70]" />
                                        Fechas
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[92vw] max-w-[700px] p-4 sm:p-5" align="end">
                                    <div className="space-y-4">
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div className="space-y-1.5">
                                                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#0F172A]/55">
                                                    Desde
                                                </p>
                                                <SpanishDateInput
                                                    value={toIsoDateValue(range.from)}
                                                    onChange={updateFromIsoDate}
                                                    className="h-11 border-slate-200 bg-white"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#0F172A]/55">
                                                    Hasta
                                                </p>
                                                <SpanishDateInput
                                                    value={toIsoDateValue(range.to)}
                                                    onChange={updateToIsoDate}
                                                    className="h-11 border-slate-200 bg-white"
                                                />
                                            </div>
                                        </div>
                                        <Calendar
                                            mode="range"
                                            selected={range}
                                            onSelect={handleRangeChange}
                                            numberOfMonths={2}
                                            locale={es}
                                            className="rounded-3xl border border-slate-200/70 bg-white p-3"
                                        />
                                        <div className="flex justify-end">
                                            <Button
                                                type="button"
                                                size="sm"
                                                className="px-5"
                                                onClick={() => setIsDatePopoverOpen(false)}
                                            >
                                                Aplicar
                                            </Button>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-[#0F172A]/70">
                                {selectedRangeDays} días
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-[#0F172A]/70">
                                {formatRangeLabel(range)}
                                <button
                                    type="button"
                                    className="rounded-md p-0.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                                    onClick={() => applyLastDays(MAX_RANGE_DAYS)}
                                    aria-label="Restablecer rango"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        </div>
                        {rangeError && (
                            <p className="mt-2 text-xs text-destructive">{rangeError}</p>
                        )}
                    </div>
                )}
            </div>

            <Card>
                <CardHeader className="pb-1">
                    <CardTitle className="text-sm font-semibold text-[#0F172A]">Capacidad de catálogo</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-[#0F172A]/55">{slotUsageText}</p>
                </CardContent>
            </Card>

            {isExplorerScope && (
                <Card className="mt-1 overflow-hidden">
                    <CardContent className="relative !px-4 !pb-5 !pt-5 sm:!px-6 sm:!pb-6 sm:!pt-6">
                        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                            <div className="w-full overflow-hidden rounded-xl border border-slate-200/55 bg-white/45">
                                <div className="px-4 pt-3 pb-1">
                                    <p className="text-sm font-semibold text-[#0F172A]">Visitas diarias</p>
                                </div>
                                <div className="h-[248px] p-0 blur-[4px] opacity-75 pointer-events-none">
                                    <EngagementLineChart
                                        data={explorerPreviewViews}
                                        color="#F19D70"
                                        label="Visitas"
                                    />
                                </div>
                            </div>

                            <div className="w-full overflow-hidden rounded-xl border border-slate-200/55 bg-white/45">
                                <div className="px-4 pt-3 pb-1">
                                    <p className="text-sm font-semibold text-[#0F172A]">Mensajes diarios</p>
                                </div>
                                <div className="h-[248px] p-0 blur-[4px] opacity-75 pointer-events-none">
                                    <EngagementLineChart
                                        data={explorerPreviewMessages}
                                        color="#E59A73"
                                        label="Mensajes"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-4 py-5 sm:px-6 sm:py-6">
                            <div className="pointer-events-auto w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                                <p className="text-sm font-semibold text-[#0F172A]">
                                    Ventajas de User Pro
                                </p>
                                <ul className="mt-2 space-y-1 text-sm leading-relaxed text-[#0F172A]/60 list-disc pl-5">
                                    <li>Amplia tu límite de 2 a 5 productos activos.</li>
                                    <li>Consulta visitas y mensajes reales por producto.</li>
                                    <li>Detecta qué productos convierten mejor.</li>
                                    <li>Gestiona tu suscripción desde Stripe Customer Portal.</li>
                                </ul>
                                <Button
                                    type="button"
                                    className="mt-3 w-full"
                                    onClick={() => {
                                        void handleUpgradeToUserPro();
                                    }}
                                    disabled={createCheckoutMutation.isPending}
                                >
                                    {createCheckoutMutation.isPending ? "Redirigiendo..." : "Hazte User Pro"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {!isExplorerScope && error && (
                <Card>
                    <CardContent className="py-6 text-sm text-destructive">
                        Error al cargar métricas.
                    </CardContent>
                </Card>
            )}

            {(isCompanyScope || isUserProScope) && (
                <>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-[#0F172A]">Visitas únicas</CardTitle>
                                <Eye className="h-4 w-4 text-[#F19D70]" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {isLoading
                                        ? "..."
                                        : isCompanyScope
                                            ? companyStatsQuery.data?.summary.uniqueVisitors ?? 0
                                            : userStatsQuery.data?.summary.uniqueVisitors ?? 0}
                                </div>
                                <p className="text-xs text-[#0F172A]/55">
                                    {isLoading
                                        ? "..."
                                        : `${isCompanyScope ? companyStatsQuery.data?.summary.totalViews ?? 0 : userStatsQuery.data?.summary.totalViews ?? 0} visitas totales`}
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
                                    {isLoading
                                        ? "..."
                                        : isCompanyScope
                                            ? companyStatsQuery.data?.summary.messagesTotal ?? 0
                                            : userStatsQuery.data?.summary.messagesTotal ?? 0}
                                </div>
                                <p className="text-xs text-[#0F172A]/55">
                                    {isLoading
                                        ? "..."
                                        : `${isCompanyScope ? companyStatsQuery.data?.summary.messageThreads ?? 0 : userStatsQuery.data?.summary.messageThreads ?? 0} conversaciones`}
                                </p>
                            </CardContent>
                        </Card>

                        {isCompanyScope && (
                            <PlanGuard
                                requiredCompanyPlans={["pro", "enterprise"]}
                                requireCompanyContext
                                fallback={
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-[#0F172A]">Analítica avanzada</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-xs text-[#0F172A]/55">
                                            Disponible en plan Empresa Pro o superior.
                                        </CardContent>
                                    </Card>
                                }
                            >
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-[#0F172A]">Repetición de visitantes</CardTitle>
                                        <Repeat className="h-4 w-4 text-[#F19D70]" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {isLoading ? "..." : formatPercent(companyStatsQuery.data?.summary.repeatVisitorRatio ?? 0)}
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
                                            {isLoading ? "..." : formatPercent(companyStatsQuery.data?.summary.messageToRentalRatio ?? 0)}
                                        </p>
                                    </CardContent>
                                </Card>
                            </PlanGuard>
                        )}
                    </div>

                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                        <Card className="w-full overflow-hidden">
                            <CardHeader>
                                <CardTitle>Visitas diarias</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 h-[320px] sm:h-[380px]">
                                <EngagementLineChart
                                    data={viewsChartData}
                                    color="#F19D70"
                                    label="Visitas"
                                />
                            </CardContent>
                        </Card>

                        <Card className="w-full overflow-hidden">
                            <CardHeader>
                                <CardTitle>Mensajes diarios</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 h-[320px] sm:h-[380px]">
                                <EngagementLineChart
                                    data={messagesChartData}
                                    color="#E59A73"
                                    label="Mensajes"
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
                        <Card className="xl:col-span-2 overflow-hidden">
                            <CardHeader>
                                <CardTitle>Desglose por producto</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table className="min-w-[760px]">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Producto</TableHead>
                                            <TableHead>Visitas</TableHead>
                                            <TableHead>Únicas</TableHead>
                                            <TableHead>Mensajes</TableHead>
                                            {isCompanyScope && isAdvancedCompanyAnalytics && (
                                                <>
                                                    <TableHead>Logadas</TableHead>
                                                    <TableHead>No logadas</TableHead>
                                                    <TableHead>Visita a mensaje</TableHead>
                                                    <TableHead>Mensaje a alquiler</TableHead>
                                                </>
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {!isLoading && isCompanyScope && (companyStatsQuery.data?.byProduct.length ?? 0) === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={isAdvancedCompanyAnalytics ? 8 : 4} className="text-center text-[#0F172A]/55">
                                                    Sin datos de productos para el período.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {!isLoading && !isCompanyScope && (userStatsQuery.data?.byProduct.length ?? 0) === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-[#0F172A]/55">
                                                    Sin datos de productos para el período.
                                                </TableCell>
                                            </TableRow>
                                        )}

                                        {isCompanyScope && (companyStatsQuery.data?.byProduct ?? []).map((product) => (
                                            <TableRow key={product.productId}>
                                                <TableCell className="font-medium">{product.productName}</TableCell>
                                                <TableCell>{product.totalViews}</TableCell>
                                                <TableCell>{product.uniqueVisitors}</TableCell>
                                                <TableCell>{product.messagesTotal}</TableCell>
                                                {isAdvancedCompanyAnalytics && (
                                                    <>
                                                        <TableCell>{product.loggedViews}</TableCell>
                                                        <TableCell>{product.anonymousViews}</TableCell>
                                                        <TableCell>{formatPercent(product.visitToMessageRatio)}</TableCell>
                                                        <TableCell>{formatPercent(product.messageToRentalRatio)}</TableCell>
                                                    </>
                                                )}
                                            </TableRow>
                                        ))}

                                        {!isCompanyScope && (userStatsQuery.data?.byProduct ?? []).map((product) => (
                                            <TableRow key={product.productId}>
                                                <TableCell className="font-medium">{product.productName}</TableCell>
                                                <TableCell>{product.totalViews}</TableCell>
                                                <TableCell>{product.uniqueVisitors}</TableCell>
                                                <TableCell>{product.messagesTotal}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {isCompanyScope && (
                            <PlanGuard
                                requiredCompanyPlans={["pro", "enterprise"]}
                                requireCompanyContext
                                fallback={
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Origen de visitas</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm text-[#0F172A]/55">
                                            Disponible en plan Empresa Pro o superior.
                                        </CardContent>
                                    </Card>
                                }
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Origen de visitas</CardTitle>
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
                            </PlanGuard>
                        )}
                    </div>

                    {isCompanyScope && isAdvancedCompanyAnalytics && companyStatsQuery.data?.opportunities.highInterestLowConversion && (
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
                                {formatPercent(companyStatsQuery.data.opportunities.highInterestLowConversion.visitToMessageRatio)}).
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
};

const extractBackendErrorMessage = (error: unknown): string | null => {
    if (!(error instanceof ApiError)) {
        return null;
    }

    const payload = error.payload as { error?: unknown } | undefined;
    const backendError = payload?.error;

    if (Array.isArray(backendError) && typeof backendError[0] === "string") {
        return backendError[0];
    }

    if (typeof backendError === "string") {
        return backendError;
    }

    return null;
};

export default DashboardOverview;
