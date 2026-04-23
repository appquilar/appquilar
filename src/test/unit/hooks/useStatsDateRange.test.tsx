import { act, renderHook } from "@testing-library/react";
import { format } from "date-fns";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useStatsDateRange } from "@/hooks/useStatsDateRange";

const formatIso = (date: Date | undefined) => (date ? format(date, "yyyy-MM-dd") : undefined);

describe("useStatsDateRange", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 3, 19, 12, 0, 0));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("clamps defaults to the configured maximum and exposes the preset period", () => {
        const { result } = renderHook(() =>
            useStatsDateRange({ defaultDays: 60, maxRangeDays: 14 })
        );

        expect(result.current.maxRangeDays).toBe(14);
        expect(result.current.selectedRangeDays).toBe(14);
        expect(result.current.period).toEqual({
            from: "2026-04-06",
            to: "2026-04-19",
        });
        expect(result.current.isPresetRange(14)).toBe(true);
        expect(result.current.isPresetRange(7)).toBe(false);
    });

    it("handles partial, oversized and valid manual range changes", () => {
        const { result } = renderHook(() =>
            useStatsDateRange({ defaultDays: 3, maxRangeDays: 7 })
        );

        act(() => {
            result.current.handleRangeChange(undefined);
        });
        expect(result.current.period).toEqual({
            from: "2026-04-17",
            to: "2026-04-19",
        });

        act(() => {
            result.current.handleRangeChange({ from: new Date(2026, 3, 10) });
        });
        expect(result.current.rangeError).toBeNull();
        expect(formatIso(result.current.range.from)).toBe("2026-04-10");
        expect(formatIso(result.current.range.to)).toBe("2026-04-10");

        act(() => {
            result.current.handleRangeChange({
                from: new Date(2026, 3, 1, 15, 0, 0),
                to: new Date(2026, 3, 10, 9, 0, 0),
            });
        });
        expect(result.current.rangeError).toBe("El rango máximo es de 7 días.");
        expect(formatIso(result.current.range.from)).toBe("2026-04-10");
        expect(formatIso(result.current.range.to)).toBe("2026-04-10");

        act(() => {
            result.current.handleRangeChange({
                from: new Date(2026, 3, 12, 18, 0, 0),
                to: new Date(2026, 3, 15, 8, 0, 0),
            });
        });
        expect(result.current.rangeError).toBeNull();
        expect(result.current.selectedRangeDays).toBe(4);
        expect(result.current.period).toEqual({
            from: "2026-04-12",
            to: "2026-04-15",
        });
    });

    it("applies presets, exposes popover state and keeps iso updates in bounds", () => {
        const { result } = renderHook(() =>
            useStatsDateRange({ defaultDays: 5, maxRangeDays: 30 })
        );

        act(() => {
            result.current.setIsDatePopoverOpen(true);
        });
        expect(result.current.isDatePopoverOpen).toBe(true);

        act(() => {
            result.current.applyLastDays(60);
        });
        expect(result.current.selectedRangeDays).toBe(30);
        expect(result.current.period).toEqual({
            from: "2026-03-21",
            to: "2026-04-19",
        });

        act(() => {
            result.current.updateFromIsoDate("2026-04-18");
        });
        expect(result.current.period).toEqual({
            from: "2026-04-18",
            to: "2026-04-19",
        });

        act(() => {
            result.current.updateToIsoDate("2026-04-15");
        });
        expect(result.current.period).toEqual({
            from: "2026-04-15",
            to: "2026-04-15",
        });

        act(() => {
            result.current.updateFromIsoDate("");
            result.current.updateToIsoDate("");
        });
        expect(result.current.period).toEqual({
            from: "2026-04-15",
            to: "2026-04-15",
        });
    });
});
