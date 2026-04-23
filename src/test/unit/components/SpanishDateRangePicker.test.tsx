import { describe, expect, it, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { act, screen } from "@testing-library/react";

import SpanishDateRangePicker from "@/components/products/SpanishDateRangePicker";
import { renderWithProviders } from "@/test/utils/renderWithProviders";

let lastCalendarProps: Record<string, unknown> | null = null;

vi.mock("@/components/ui/calendar", () => ({
  Calendar: (props: Record<string, unknown>) => {
    lastCalendarProps = props;
    return <div data-testid="calendar-probe" />;
  },
}));

describe("SpanishDateRangePicker", () => {
  beforeEach(() => {
    lastCalendarProps = null;
  });

  it("guides the user without prefilled dates and enforces future multi-day ranges", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <SpanishDateRangePicker
        startDate=""
        endDate=""
        onStartDateChange={vi.fn()}
        onEndDateChange={vi.fn()}
      />
    );

    expect(screen.getAllByText("Selecciona")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Seleccionar fechas de alquiler" }));

    expect(screen.getByText("Selecciona las fechas")).toBeInTheDocument();
    expect(screen.getByText("Primero elige la recogida y después una devolución posterior.")).toBeInTheDocument();
    expect(screen.getByText("Elige primero la recogida")).toBeInTheDocument();
    expect(screen.getByTestId("calendar-probe")).toBeInTheDocument();
    expect(lastCalendarProps?.mode).toBe("range");
    expect(lastCalendarProps?.numberOfMonths).toBe(2);

    const disabled = lastCalendarProps?.disabled as { before?: Date } | undefined;
    expect(disabled?.before).toBeInstanceOf(Date);
  });

  it("shows partial labels and propagates clear, same-day and multi-day selections", async () => {
    const user = userEvent.setup();
    const onStartDateChange = vi.fn();
    const onEndDateChange = vi.fn();

    renderWithProviders(
      <SpanishDateRangePicker
        startDate="2026-04-20"
        endDate=""
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        invalid
      />
    );

    expect(screen.getByText("20/04/2026")).toBeInTheDocument();
    expect(screen.getByText("Selecciona")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Seleccionar fechas de alquiler" }));

    expect(screen.getByText("20/04/2026 - Elige la devolución")).toBeInTheDocument();

    const onSelect = lastCalendarProps?.onSelect as
      | ((range?: { from?: Date; to?: Date }) => void)
      | undefined;

    act(() => {
      onSelect?.(undefined);
    });
    expect(onStartDateChange).toHaveBeenNthCalledWith(1, "");
    expect(onEndDateChange).toHaveBeenNthCalledWith(1, "");

    act(() => {
      onSelect?.({
        from: new Date("2026-04-20T10:00:00Z"),
        to: new Date("2026-04-20T20:00:00Z"),
      });
    });
    expect(onStartDateChange).toHaveBeenNthCalledWith(2, "2026-04-20");
    expect(onEndDateChange).toHaveBeenNthCalledWith(2, "");

    act(() => {
      onSelect?.({
        from: new Date("2026-04-20T10:00:00Z"),
        to: new Date("2026-04-22T10:00:00Z"),
      });
    });
    expect(onStartDateChange).toHaveBeenNthCalledWith(3, "2026-04-20");
    expect(onEndDateChange).toHaveBeenNthCalledWith(3, "2026-04-22");
  });
});
