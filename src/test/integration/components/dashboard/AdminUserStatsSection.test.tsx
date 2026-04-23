import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AdminUserStatsSection } from "@/components/dashboard/stats/AdminUserStatsSection";

const useUserEngagementStatsMock = vi.fn();
const useStatsDateRangeMock = vi.fn();

vi.mock("@/application/hooks/useUserEngagementStats", () => ({
    useUserEngagementStats: (...args: unknown[]) => useUserEngagementStatsMock(...args),
}));

vi.mock("@/hooks/useStatsDateRange", () => ({
    useStatsDateRange: () => useStatsDateRangeMock(),
}));

vi.mock("@/components/dashboard/stats/StatsDateRangeToolbar", () => ({
    StatsDateRangeToolbar: () => <div>toolbar-range</div>,
}));

vi.mock("@/components/dashboard/stats/EngagementLineChart", () => ({
    default: () => <div>line-chart</div>,
}));

const userStatsFixture = {
    userId: "user-1",
    period: { from: "2026-04-01", to: "2026-04-07" },
    summary: {
        totalViews: 92,
        uniqueVisitors: 51,
        messagesTotal: 14,
        messageThreads: 6,
    },
    dailyViews: [
        { day: "2026-04-01", views: 11 },
        { day: "2026-04-02", views: 16 },
    ],
    dailyMessages: [
        { day: "2026-04-01", messages: 1 },
        { day: "2026-04-02", messages: 2 },
    ],
    byProduct: [
        {
            productId: "product-1",
            productName: "Mesa de corte",
            productSlug: "mesa-corte",
            productInternalId: "MSC-001",
            totalViews: 40,
            uniqueVisitors: 25,
            messagesTotal: 6,
            messageThreads: 3,
        },
    ],
};

describe("AdminUserStatsSection", () => {
    beforeEach(() => {
        useUserEngagementStatsMock.mockReset();
        useStatsDateRangeMock.mockReset();
        useStatsDateRangeMock.mockReturnValue({
            range: {
                from: "2026-04-01",
                to: "2026-04-07",
            },
            period: { from: "2026-04-01", to: "2026-04-07" },
            rangeError: null,
            isDatePopoverOpen: false,
            setIsDatePopoverOpen: vi.fn(),
            selectedRangeDays: 7,
            maxRangeDays: 90,
            handleRangeChange: vi.fn(),
            applyLastDays: vi.fn(),
            updateFromIsoDate: vi.fn(),
            updateToIsoDate: vi.fn(),
            isPresetRange: vi.fn().mockReturnValue(true),
        });
    });

    it("renders the selected user stats for admins", () => {
        useUserEngagementStatsMock.mockReturnValue({
            isLoading: false,
            error: null,
            data: userStatsFixture,
        });

        render(
            <AdminUserStatsSection
                userId="user-1"
                userLabel="Lucía Pérez"
            />
        );

        expect(screen.getByText("Estadísticas de usuario")).toBeInTheDocument();
        expect(screen.getByText(/Lucía Pérez/)).toBeInTheDocument();
        expect(screen.getByText("Mesa de corte")).toBeInTheDocument();
        expect(screen.getAllByText("Conversaciones")).toHaveLength(2);
    });

    it("renders an inline error when the user metrics request fails", () => {
        useUserEngagementStatsMock.mockReturnValue({
            isLoading: false,
            error: new Error("boom"),
            data: null,
        });

        render(
            <AdminUserStatsSection
                userId="user-1"
                userLabel="Lucía Pérez"
            />
        );

        expect(
            screen.getByText("Error al cargar las métricas del usuario seleccionado.")
        ).toBeInTheDocument();
    });

    it("supports sorting, search and pagination while showing empty chart placeholders", async () => {
        const user = userEvent.setup();

        useUserEngagementStatsMock.mockReturnValue({
            isLoading: false,
            error: null,
            data: {
                ...userStatsFixture,
                dailyViews: [],
                dailyMessages: [],
                byProduct: Array.from({ length: 9 }, (_, index) => ({
                    productId: `product-${index + 1}`,
                    productName: `Producto ${index + 1}`,
                    productSlug: `producto-${index + 1}`,
                    productInternalId: `SKU-${index + 1}`,
                    totalViews: 100 - index,
                    uniqueVisitors: 90 - index,
                    messagesTotal: 20 - index,
                    messageThreads: 10 - index,
                })),
            },
        });

        render(
            <AdminUserStatsSection
                userId="user-1"
                userLabel="Lucía Pérez"
            />
        );

        expect(screen.getAllByText("Sin datos que mostrar")).toHaveLength(2);
        expect(screen.getByText("Página 1 de 2")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Siguiente" }));
        expect(screen.getByText("Página 2 de 2")).toBeInTheDocument();
        expect(screen.getByText("Producto 9")).toBeInTheDocument();

        const searchInput = screen.getByPlaceholderText("Buscar por nombre o ID interno...");
        await user.clear(searchInput);
        await user.type(searchInput, "SKU-3");

        expect(screen.getByText("Producto 3")).toBeInTheDocument();
        expect(screen.queryByText("Producto 1")).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /Producto/i }));
        expect(screen.getByText("Producto 3")).toBeInTheDocument();
    });
});
