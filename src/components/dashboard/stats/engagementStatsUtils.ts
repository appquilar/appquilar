import { eachDayOfInterval, endOfDay, format, startOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";

import type { EngagementLineChartPoint } from "@/components/dashboard/stats/EngagementLineChart";

interface EngagementSeriesRow {
    day: string;
    value: number;
}

export const formatEngagementPercent = (value: number): string =>
    `${(value * 100).toFixed(1)}%`;

export const normalizeEngagementSeries = (
    range: DateRange,
    rows: EngagementSeriesRow[]
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
