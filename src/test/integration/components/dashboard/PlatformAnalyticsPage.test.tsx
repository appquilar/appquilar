import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import PlatformAnalyticsPage from "@/components/dashboard/analytics/PlatformAnalyticsPage";

const useAdminPlatformAnalyticsMock = vi.fn();

vi.mock("@/application/hooks/useAdminPlatformAnalytics", () => ({
    useAdminPlatformAnalytics: (...args: unknown[]) => useAdminPlatformAnalyticsMock(...args),
}));

vi.mock("@/components/dashboard/stats/StatsDateRangeToolbar", () => ({
    StatsDateRangeToolbar: () => <div>toolbar-range</div>,
}));

vi.mock("@/components/dashboard/stats/EngagementLineChart", () => ({
    default: () => <div>line-chart</div>,
}));

const createAnalyticsData = () => ({
    period: { from: "2026-04-09", to: "2026-04-15" },
    previousPeriod: { from: "2026-04-02", to: "2026-04-08" },
    homepage: {
        period: { from: "2026-04-09", to: "2026-04-15" },
        previousPeriod: { from: "2026-04-02", to: "2026-04-08" },
        executiveSummary: { cards: [] },
        activation: { steps: [], notes: [] },
        operations: { cards: [], bestResponders: [], slowResponders: [], dailyMessages: [] },
        marketplace: {
            categories: [],
            growthCategories: [],
            weakCategories: [],
            unsupportedSections: [],
        },
        insights: [
            {
                key: "signal",
                title: "Hay cuentas con encaje de upgrade",
                description: "Señal comercial disponible.",
                severity: "info",
                metrics: [],
            },
        ],
        attentionItems: [],
        callToActionHref: "/dashboard/platform-analytics",
    },
    overview: {
        cards: [
            {
                key: "active_companies_period",
                label: "Empresas activas",
                value: 14,
                format: "count",
                delta: { kind: "increase", absoluteChange: 2, percentageChange: 16.6 },
            },
        ],
        planDistribution: [
            {
                key: "company-pro",
                label: "Empresa Pro",
                total: 4,
                active: 4,
                paid: true,
            },
        ],
        dailyViews: [{ day: "2026-04-09", value: 12 }],
        dailyMessages: [{ day: "2026-04-09", value: 4 }],
    },
    activation: {
        steps: [],
        notes: ["No cohortes en esta iteración."],
    },
    marketplace: {
        categories: [],
        growthCategories: [],
        weakCategories: [],
        unsupportedSections: [
            {
                key: "zones",
                label: "Zonas y cobertura",
                availability: {
                    available: false,
                    reason: "No soportado por OpenAPI.",
                },
            },
        ],
    },
    operations: {
        cards: [],
        bestResponders: [],
        slowResponders: [],
        dailyMessages: [],
    },
    monetization: {
        cards: [
            {
                key: "paid_accounts",
                label: "Cuentas paid",
                value: 6,
                format: "count",
                delta: { kind: "neutral", absoluteChange: 0, percentageChange: 0 },
            },
        ],
        planDistribution: [
            {
                key: "user-pro",
                label: "Usuario Pro",
                total: 2,
                active: 2,
                paid: true,
            },
        ],
        upgradeCandidates: [
            {
                key: "upgrade-company",
                title: "Acme Rentals",
                description: "Actividad suficiente para valorar upgrade.",
                severity: "success",
                href: "/dashboard/companies/company-1",
            },
        ],
        nearLimitAccounts: [
            {
                key: "company-1",
                label: "8/10 productos activos",
                ownerName: "Acme Rentals",
                used: 8,
                limit: 10,
                usageRatio: 0.8,
                planLabel: "starter",
                href: "/dashboard/companies/company-1/products",
            },
        ],
    },
    qualityRisk: {
        cards: [],
        productsWithoutImage: [],
        productsWithoutPrice: [],
        dormantCompanies: [],
        actionItems: [],
    },
    retention: {
        availability: {
            available: false,
            reason: "No soportado por OpenAPI.",
        },
    },
});

describe("PlatformAnalyticsPage", () => {
    beforeEach(() => {
        useAdminPlatformAnalyticsMock.mockReset();
    });

    it("renders loading and error states", () => {
        useAdminPlatformAnalyticsMock.mockReturnValueOnce({
            isLoading: true,
            isError: false,
            data: null,
        });

        const { rerender } = render(
            <MemoryRouter>
                <PlatformAnalyticsPage />
            </MemoryRouter>
        );

        expect(screen.getByText("Cargando métricas internas para admins.")).toBeInTheDocument();

        useAdminPlatformAnalyticsMock.mockReturnValueOnce({
            isLoading: false,
            isError: true,
            data: null,
        });

        rerender(
            <MemoryRouter>
                <PlatformAnalyticsPage />
            </MemoryRouter>
        );

        expect(screen.getByText("No se pudo cargar la analítica interna.")).toBeInTheDocument();
        expect(screen.getByText("La vista de detalle no está disponible ahora mismo. Reintenta en unos segundos.")).toBeInTheDocument();
    });

    it("renders the admin detail tabs and monetization content", async () => {
        useAdminPlatformAnalyticsMock.mockReturnValue({
            isLoading: false,
            isError: false,
            data: createAnalyticsData(),
        });

        render(
            <MemoryRouter>
                <PlatformAnalyticsPage />
            </MemoryRouter>
        );

        expect(screen.getByText("Analítica de plataforma")).toBeInTheDocument();
        expect(screen.getByText("toolbar-range")).toBeInTheDocument();
        expect(screen.getByRole("tab", { name: "Overview" })).toBeInTheDocument();
        expect(screen.getByText("Empresas activas")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("tab", { name: "Monetización" }));

        expect(screen.getByText("Cuentas paid")).toBeInTheDocument();
        expect(screen.getAllByText("Acme Rentals").length).toBeGreaterThan(0);
        expect(screen.getByText("Uso de capacidad del plan")).toBeInTheDocument();
    });

    it("renders activation, marketplace, operations and quality tabs with supported content and placeholders", async () => {
        useAdminPlatformAnalyticsMock.mockReturnValue({
            isLoading: false,
            isError: false,
            data: {
                ...createAnalyticsData(),
                overview: {
                    cards: [],
                    planDistribution: [],
                    dailyViews: [],
                    dailyMessages: [],
                },
                activation: {
                    steps: [
                        {
                            key: "activation-profile",
                            label: "Perfil creado",
                            value: 12,
                            shareOfFirstStep: 1,
                            conversionFromPrevious: null,
                            dropOffFromPrevious: null,
                            availability: {
                                available: false,
                                reason: "Solo soporte parcial.",
                            },
                        },
                    ],
                    notes: ["Seguimos sin cohortes avanzadas."],
                },
                marketplace: {
                    categories: [
                        {
                            categoryId: "cat-1",
                            categoryName: "Herramientas",
                            publishedProducts: 4,
                            conversationThreads: 6,
                            previousConversationThreads: 3,
                            demandOfferRatio: 1.5,
                            delta: { kind: "increase", absoluteChange: 3, percentageChange: 100 },
                        },
                    ],
                    growthCategories: [
                        {
                            categoryId: "cat-2",
                            categoryName: "Iluminación",
                            publishedProducts: 2,
                            conversationThreads: 5,
                            previousConversationThreads: 2,
                            demandOfferRatio: 2.5,
                            delta: { kind: "increase", absoluteChange: 3, percentageChange: 150 },
                        },
                    ],
                    weakCategories: [
                        {
                            categoryId: "cat-3",
                            categoryName: "Andamios",
                            publishedProducts: 8,
                            conversationThreads: 1,
                            previousConversationThreads: 4,
                            demandOfferRatio: 0.12,
                            delta: { kind: "decrease", absoluteChange: -3, percentageChange: -75 },
                        },
                    ],
                    unsupportedSections: [
                        {
                            key: "searches",
                            label: "Búsquedas",
                            availability: {
                                available: false,
                                reason: "No soportado por OpenAPI.",
                            },
                        },
                    ],
                },
                operations: {
                    cards: [
                        {
                            key: "response-time",
                            label: "Tiempo de respuesta",
                            value: 32,
                            format: "duration_minutes",
                            delta: { kind: "increase", absoluteChange: 6, percentageChange: 23 },
                        },
                    ],
                    bestResponders: [
                        {
                            key: "best-1",
                            label: "Rápidos SL",
                            value: 12,
                            href: "/dashboard/companies/best-1",
                        },
                    ],
                    slowResponders: [
                        {
                            key: "slow-1",
                            label: "Lentos SL",
                            value: 90,
                            href: "/dashboard/companies/slow-1",
                        },
                    ],
                    dailyMessages: [],
                },
                qualityRisk: {
                    cards: [
                        {
                            key: "quality-card",
                            label: "Riesgos",
                            value: 3,
                            format: "count",
                            delta: { kind: "increase", absoluteChange: 1, percentageChange: 50 },
                        },
                    ],
                    productsWithoutImage: [
                        {
                            key: "product-without-image",
                            title: "Taladro sin foto",
                            description: "Falta enriquecer la ficha visual.",
                            severity: "warning",
                            href: "/dashboard/products/product-1",
                        },
                    ],
                    productsWithoutPrice: [
                        {
                            key: "product-without-price",
                            title: "Foco sin precio",
                            description: "No hay tarifa diaria disponible.",
                            severity: "warning",
                            href: "/dashboard/products/product-2",
                        },
                    ],
                    dormantCompanies: [
                        {
                            key: "company-dormant",
                            title: "Dormant Tools",
                            description: "Sin visitas ni conversaciones en el periodo.",
                            severity: "warning",
                            href: "/dashboard/companies/company-2",
                        },
                    ],
                    actionItems: [
                        {
                            key: "action-company",
                            title: "Revisar Acme Rentals",
                            description: "Cuenta prioritaria para seguimiento.",
                            severity: "info",
                            href: "/dashboard/companies/company-1",
                        },
                    ],
                },
            },
        });

        render(
            <MemoryRouter>
                <PlatformAnalyticsPage />
            </MemoryRouter>
        );

        await userEvent.click(screen.getByRole("tab", { name: "Activación" }));
        expect(screen.getByText("Perfil creado")).toBeInTheDocument();
        expect(screen.getByText("Solo soporte parcial.")).toBeInTheDocument();
        expect(screen.getByText("Seguimos sin cohortes avanzadas.")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("tab", { name: "Marketplace" }));
        expect(screen.getByText("Herramientas")).toBeInTheDocument();
        expect(screen.getByText("1,50 conv./producto")).toBeInTheDocument();
        expect(screen.getByText("Iluminación")).toBeInTheDocument();
        expect(screen.getByText("Andamios")).toBeInTheDocument();
        expect(screen.getByText("Búsquedas")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("tab", { name: "Operaciones" }));
        expect(screen.getByText("Tiempo de respuesta")).toBeInTheDocument();
        expect(screen.getByText(/Rápidos SL/)).toBeInTheDocument();
        expect(screen.getByText(/Lentos SL/)).toBeInTheDocument();
        expect(screen.getByText("Sin evolución diaria")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("tab", { name: "Calidad y riesgo" }));
        expect(screen.getByText("Taladro sin foto")).toBeInTheDocument();
        expect(screen.getByText("Foco sin precio")).toBeInTheDocument();
        expect(screen.getByText("Dormant Tools")).toBeInTheDocument();
        expect(screen.getByText("Revisar Acme Rentals")).toBeInTheDocument();
    });
});
