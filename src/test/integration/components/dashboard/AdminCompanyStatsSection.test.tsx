import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AdminCompanyStatsSection } from "@/components/dashboard/stats/AdminCompanyStatsSection";

const useCompanyEngagementStatsMock = vi.fn();
const useStatsDateRangeMock = vi.fn();

vi.mock("@/application/hooks/useCompanyEngagementStats", () => ({
    useCompanyEngagementStats: (...args: unknown[]) => useCompanyEngagementStatsMock(...args),
}));

vi.mock("@/hooks/useStatsDateRange", () => ({
    useStatsDateRange: () => useStatsDateRangeMock(),
}));

vi.mock("@/components/dashboard/stats/CompanyAdvancedStatsPremium", () => ({
    CompanyAdvancedStatsPremium: () => <div>premium-block</div>,
}));

vi.mock("@/components/dashboard/stats/StatsDateRangeToolbar", () => ({
    StatsDateRangeToolbar: () => <div>toolbar-range</div>,
}));

vi.mock("@/components/dashboard/stats/EngagementLineChart", () => ({
    default: () => <div>line-chart</div>,
}));

const companyStatsFixture = {
    companyId: "company-1",
    period: { from: "2026-04-01", to: "2026-04-07" },
    summary: {
        totalViews: 240,
        uniqueVisitors: 120,
        repeatVisitors: 32,
        repeatVisitorRatio: 0.266,
        loggedViews: 180,
        anonymousViews: 60,
        messagesTotal: 24,
        messageThreads: 8,
        messageToRentalRatio: 0.2,
        averageFirstResponseMinutes: 45,
    },
    topLocations: [
        {
            country: "España",
            region: "Madrid",
            city: "Madrid",
            totalViews: 80,
            uniqueVisitors: 40,
        },
    ],
    dailyViews: [
        { day: "2026-04-01", views: 12 },
        { day: "2026-04-02", views: 20 },
    ],
    dailyMessages: [
        { day: "2026-04-01", messages: 3 },
        { day: "2026-04-02", messages: 4 },
    ],
    byProduct: [
        {
            productId: "product-1",
            productName: "Taladro Pro",
            productSlug: "taladro-pro",
            productInternalId: "TLD-001",
            totalViews: 120,
            uniqueVisitors: 70,
            loggedViews: 90,
            anonymousViews: 30,
            messagesTotal: 12,
            messageThreads: 5,
            visitToMessageRatio: 0.1,
            messageToRentalRatio: 0.2,
        },
    ],
    opportunities: {
        highInterestLowConversion: {
            productId: "product-1",
            productName: "Taladro Pro",
            productSlug: "taladro-pro",
            productInternalId: "TLD-001",
            totalViews: 120,
            uniqueVisitors: 70,
            loggedViews: 90,
            anonymousViews: 30,
            messagesTotal: 12,
            messageThreads: 5,
            visitToMessageRatio: 0.1,
            messageToRentalRatio: 0.2,
        },
    },
};

describe("AdminCompanyStatsSection", () => {
    beforeEach(() => {
        useCompanyEngagementStatsMock.mockReset();
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

    it("renders company stats and the premium block for the selected company", () => {
        useCompanyEngagementStatsMock.mockReturnValue({
            isLoading: false,
            error: null,
            data: companyStatsFixture,
        });

        render(
            <AdminCompanyStatsSection
                companyId="company-1"
                companyName="Acme Rentals"
            />
        );

        expect(screen.getByText("Estadísticas de empresa")).toBeInTheDocument();
        expect(screen.getByText("premium-block")).toBeInTheDocument();
        expect(screen.getAllByText("Taladro Pro")).toHaveLength(2);
        expect(screen.getByText("Top ubicaciones")).toBeInTheDocument();
        expect(screen.getByText(/Acme Rentals/)).toBeInTheDocument();
    });

    it("renders an inline error when the company metrics request fails", () => {
        useCompanyEngagementStatsMock.mockReturnValue({
            isLoading: false,
            error: new Error("boom"),
            data: null,
        });

        render(
            <AdminCompanyStatsSection
                companyId="company-1"
                companyName="Acme Rentals"
            />
        );

        expect(
            screen.getByText("Error al cargar las métricas de la empresa seleccionada.")
        ).toBeInTheDocument();
    });

    it("supports product search, pagination and empty chart placeholders", async () => {
        const user = userEvent.setup();

        useCompanyEngagementStatsMock.mockReturnValue({
            isLoading: false,
            error: null,
            data: {
                ...companyStatsFixture,
                topLocations: [],
                dailyViews: [],
                dailyMessages: [],
                opportunities: {},
                byProduct: Array.from({ length: 9 }, (_, index) => ({
                    productId: `product-${index + 1}`,
                    productName: `Producto ${index + 1}`,
                    productSlug: `producto-${index + 1}`,
                    productInternalId: `SKU-${index + 1}`,
                    totalViews: 100 - index,
                    uniqueVisitors: 80 - index,
                    loggedViews: 50 - index,
                    anonymousViews: 20,
                    messagesTotal: 20 - index,
                    messageThreads: 10 - index,
                    visitToMessageRatio: 0.2,
                    messageToRentalRatio: 0.1,
                })),
            },
        });

        render(
            <AdminCompanyStatsSection
                companyId="company-1"
                companyName="Acme Rentals"
            />
        );

        expect(screen.getAllByText("Sin datos que mostrar")).toHaveLength(2);
        expect(screen.getByText("Página 1 de 2")).toBeInTheDocument();
        expect(screen.getByText("Sin ubicación disponible todavía.")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Siguiente" }));
        expect(screen.getByText("Página 2 de 2")).toBeInTheDocument();
        expect(screen.getByText("Producto 9")).toBeInTheDocument();

        const searchInput = screen.getByPlaceholderText("Buscar por nombre o ID interno...");
        await user.clear(searchInput);
        await user.type(searchInput, "SKU-3");

        expect(screen.getByText("Producto 3")).toBeInTheDocument();
        expect(screen.queryByText("Producto 1")).not.toBeInTheDocument();
    });
});
