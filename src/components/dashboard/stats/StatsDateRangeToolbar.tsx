import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { CalendarRange, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import SpanishDateInput from "@/components/products/SpanishDateInput";

interface StatsDateRangeToolbarProps {
    range: DateRange;
    selectedRangeDays: number;
    isDatePopoverOpen: boolean;
    onDatePopoverOpenChange: (open: boolean) => void;
    rangeError: string | null;
    maxRangeDays: number;
    onApplyLastDays: (days: number) => void;
    onRangeChange: (range: DateRange | undefined) => void;
    onUpdateFromIsoDate: (value: string) => void;
    onUpdateToIsoDate: (value: string) => void;
    isPresetRange: (days: number) => boolean;
}

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

export const StatsDateRangeToolbar = ({
    range,
    selectedRangeDays,
    isDatePopoverOpen,
    onDatePopoverOpenChange,
    rangeError,
    maxRangeDays,
    onApplyLastDays,
    onRangeChange,
    onUpdateFromIsoDate,
    onUpdateToIsoDate,
    isPresetRange,
}: StatsDateRangeToolbarProps) => {
    const presetDays = maxRangeDays > 7 ? [7, maxRangeDays] : [maxRangeDays];

    return (
        <div className="dashboard-toolbar rounded-xl border border-slate-200/80 bg-white/80 p-2.5 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {presetDays.map((days) => (
                    <Button
                        key={days}
                        type="button"
                        variant="outline"
                        size="sm"
                        className={`shrink-0 border-slate-200 bg-white px-4 ${isPresetRange(days) ? "border-[#F19D70]/50 bg-[#F19D70]/10 text-[#C86A35]" : ""}`}
                        onClick={() => onApplyLastDays(days)}
                    >
                        {days}D
                    </Button>
                ))}

                <Popover open={isDatePopoverOpen} onOpenChange={onDatePopoverOpenChange}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0 border-slate-200 bg-white px-4 text-[#0F172A] hover:bg-slate-50"
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
                                        onChange={onUpdateFromIsoDate}
                                        className="h-11 border-slate-200 bg-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#0F172A]/55">
                                        Hasta
                                    </p>
                                    <SpanishDateInput
                                        value={toIsoDateValue(range.to)}
                                        onChange={onUpdateToIsoDate}
                                        className="h-11 border-slate-200 bg-white"
                                    />
                                </div>
                            </div>
                            <Calendar
                                mode="range"
                                selected={range}
                                onSelect={onRangeChange}
                                numberOfMonths={2}
                                locale={es}
                                className="rounded-3xl border border-slate-200/70 bg-white p-3"
                            />
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    size="sm"
                                    className="px-5"
                                    onClick={() => onDatePopoverOpenChange(false)}
                                >
                                    Aplicar
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                <span className="inline-flex shrink-0 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-[#0F172A]/70">
                    {selectedRangeDays} días
                </span>
                <span className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-[#0F172A]/70">
                    {formatRangeLabel(range)}
                    <button
                        type="button"
                        className="rounded-md p-0.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                        onClick={() => onApplyLastDays(maxRangeDays)}
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
    );
};
