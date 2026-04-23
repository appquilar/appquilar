import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import {
    differenceInCalendarDays,
    format,
    isSameDay,
    parseISO,
    startOfDay,
    subDays,
} from "date-fns";

export const DEFAULT_STATS_RANGE_DAYS = 30;

interface UseStatsDateRangeOptions {
    defaultDays?: number;
    maxRangeDays?: number;
}

export const useStatsDateRange = (
    options: UseStatsDateRangeOptions = {}
) => {
    const maxRangeDays = options.maxRangeDays ?? DEFAULT_STATS_RANGE_DAYS;
    const defaultDays = Math.max(
        1,
        Math.min(options.defaultDays ?? DEFAULT_STATS_RANGE_DAYS, maxRangeDays)
    );

    const today = useMemo(() => startOfDay(new Date()), []);
    const defaultFrom = useMemo(
        () => subDays(today, defaultDays - 1),
        [defaultDays, today]
    );

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

    const selectedRangeDays = range.from && range.to
        ? differenceInCalendarDays(range.to, range.from) + 1
        : 0;

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
        if (length > maxRangeDays) {
            setRangeError(`El rango máximo es de ${maxRangeDays} días.`);
            return;
        }

        setRange({
            from: startOfDay(next.from),
            to: startOfDay(next.to),
        });
        setRangeError(null);
    };

    const applyLastDays = (days: number) => {
        const boundedDays = Math.max(1, Math.min(days, maxRangeDays));
        const to = today;
        const from = subDays(to, boundedDays - 1);
        setRange({ from, to });
        setRangeError(null);
    };

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

    const isPresetRange = (days: number): boolean =>
        Boolean(
            range.from &&
            range.to &&
            selectedRangeDays === days &&
            isSameDay(range.to, today)
        );

    return {
        range,
        period,
        today,
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
    };
};
