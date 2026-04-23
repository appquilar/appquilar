import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SpanishDateInput from "@/components/products/SpanishDateInput";
import { renderWithProviders } from "@/test/utils/renderWithProviders";

vi.mock("@/components/ui/popover", () => ({
    Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    PopoverTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    PopoverContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/calendar", () => ({
    Calendar: ({ onSelect }: { onSelect: (date: Date | undefined) => void }) => (
        <button
            type="button"
            onClick={() => onSelect(new Date(2026, 3, 21))}
        >
            Seleccionar fecha mock
        </button>
    ),
}));

describe("SpanishDateInput", () => {
    it("formats the controlled iso value and normalizes typed dates", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        const { rerender } = renderWithProviders(
            <SpanishDateInput value="2026-04-20" onChange={onChange} />
        );

        const input = screen.getByPlaceholderText("dd/mm/aaaa");
        expect(input).toHaveValue("20/04/2026");

        rerender(<SpanishDateInput value="" onChange={onChange} />);
        expect(input).toHaveValue("");

        await user.type(input, "21-04-2026");
        expect(onChange).toHaveBeenLastCalledWith("2026-04-21");
    });

    it("clears invalid values and supports calendar selection", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        renderWithProviders(<SpanishDateInput value="" onChange={onChange} invalid={true} />);

        const input = screen.getByPlaceholderText("dd/mm/aaaa");
        await user.type(input, "31/02/2026");
        fireEvent.blur(input);

        expect(onChange).toHaveBeenLastCalledWith("");
        expect(input).toHaveAttribute("aria-invalid", "true");

        await user.clear(input);
        expect(onChange).toHaveBeenLastCalledWith("");

        await user.click(screen.getByRole("button", { name: "Seleccionar fecha mock" }));
        expect(onChange).toHaveBeenLastCalledWith("2026-04-21");
        expect(input).toHaveValue("21/04/2026");
    });
});
