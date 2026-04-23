import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import AdminPlatformAnalyticsHomeSection from "@/components/dashboard/analytics/AdminPlatformAnalyticsHomeSection";

const useAdminPlatformHomepageAnalyticsMock = vi.fn();

vi.mock("@/application/hooks/useAdminPlatformAnalytics", () => ({
    useAdminPlatformHomepageAnalytics: (...args: unknown[]) =>
        useAdminPlatformHomepageAnalyticsMock(...args),
}));

vi.mock("@/components/dashboard/stats/StatsDateRangeToolbar", () => ({
    StatsDateRangeToolbar: () => <div>toolbar-range</div>,
}));

vi.mock("@/components/dashboard/stats/EngagementLineChart", () => ({
    default: () => <div>line-chart</div>,
}));

describe("AdminPlatformAnalyticsHomeSection", () => {
    it("renders executive summary, unsupported marketplace blocks and the detail CTA", () => {
        useAdminPlatformHomepageAnalyticsMock.mockReturnValue({
            isLoading: false,
            isError: false,
            data: {
                period: { from: "2026-04-09", to: "2026-04-15" },
                previousPeriod: { from: "2026-04-02", to: "2026-04-08" },
                executiveSummary: {
                    cards: [
                        {
                            key: "active_companies_7d",
                            label: "Empresas activas 7D",
                            value: 12,
                            format: "count",
                            delta: { kind: "increase", absoluteChange: 3, percentageChange: 33.3 },
                        },
                    ],
                },
                activation: {
                    steps: [
                        {
                            key: "companies_total",
                            label: "Empresas totales",
                            value: 20,
                            previousValue: null,
                            shareOfFirstStep: 1,
                            conversionFromPrevious: null,
                            dropOffFromPrevious: null,
                            delta: { kind: "neutral", absoluteChange: 0, percentageChange: 0 },
                        },
                    ],
                    notes: ["Funnel acotado a lo soportado por OpenAPI."],
                },
                operations: {
                    cards: [
                        {
                            key: "average_first_response",
                            label: "1ª respuesta media",
                            value: 45,
                            format: "duration_minutes",
                            delta: { kind: "increase", absoluteChange: 15, percentageChange: 50 },
                            trendPreference: "lower",
                        },
                    ],
                    bestResponders: [],
                    slowResponders: [],
                    dailyMessages: [{ day: "2026-04-09", value: 4 }],
                },
                marketplace: {
                    categories: [
                        {
                            categoryId: "cat-1",
                            categoryName: "Herramientas",
                            publishedProducts: 8,
                            conversationThreads: 16,
                            previousConversationThreads: 10,
                            demandOfferRatio: 2,
                            delta: { kind: "increase", absoluteChange: 6, percentageChange: 60 },
                        },
                    ],
                    growthCategories: [],
                    weakCategories: [],
                    unsupportedSections: [
                        {
                            key: "marketplace-search",
                            label: "Búsquedas sin resultado",
                            availability: {
                                available: false,
                                reason: "No soportado por OpenAPI.",
                            },
                        },
                    ],
                },
                insights: [
                    {
                        key: "response",
                        title: "Empeora el tiempo de respuesta",
                        description: "La primera respuesta media ha subido frente al período anterior.",
                        severity: "warning",
                        metrics: [],
                    },
                ],
                attentionItems: [
                    {
                        key: "dormant-company",
                        title: "Dormant Tools",
                        description: "Empresa dormida.",
                        severity: "warning",
                        href: "/dashboard/companies/company-2",
                    },
                ],
                callToActionHref: "/dashboard/platform-analytics",
            },
        });

        render(
            <MemoryRouter>
                <AdminPlatformAnalyticsHomeSection />
            </MemoryRouter>
        );

        expect(screen.getByText("toolbar-range")).toBeInTheDocument();
        expect(screen.getByText(/Señales rápidas de plataforma para admins/i)).toBeInTheDocument();
        expect(screen.getByText("Empresas activas 7D")).toBeInTheDocument();
        expect(screen.getByText("Búsquedas sin resultado")).toBeInTheDocument();
        expect(screen.getByText("Empeora el tiempo de respuesta")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Ver analítica completa/i })).toHaveAttribute(
            "href",
            "/dashboard/platform-analytics"
        );
    });
});
