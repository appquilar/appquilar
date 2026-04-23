import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import {
    useAdminPlatformAnalytics,
    useAdminPlatformActivation,
    useAdminPlatformHomepageAnalytics,
    useAdminPlatformMarketplace,
    useAdminPlatformMonetization,
    useAdminPlatformOperations,
    useAdminPlatformOverview,
    useAdminPlatformQualityRisk,
} from "@/application/hooks/useAdminPlatformAnalytics";
import { UserRole } from "@/domain/models/UserRole";

const getAdminPlatformAnalyticsMock = vi.fn();
const useAuthMock = vi.fn();

vi.mock("@/compositionRoot", () => ({
    adminPlatformAnalyticsService: {
        getAdminPlatformAnalytics: (...args: unknown[]) => getAdminPlatformAnalyticsMock(...args),
    },
}));

vi.mock("@/context/AuthContext", () => ({
    useAuth: () => useAuthMock(),
}));

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                staleTime: 60_000,
                gcTime: 0,
            },
            mutations: {
                retry: false,
            },
        },
    });

    return {
        wrapper: ({ children }: { children: ReactNode }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
        queryClient,
    };
};

const createAnalyticsPayload = () => ({
    homepage: {
        executiveSummary: { cards: [] },
        activation: { steps: [], notes: [] },
        operations: { cards: [], bestResponders: [], slowResponders: [], dailyMessages: [] },
        marketplace: {
            categories: [],
            growthCategories: [],
            weakCategories: [],
            unsupportedSections: [],
        },
        insights: [],
        attentionItems: [],
        callToActionHref: "/dashboard/platform-analytics",
    },
    overview: { cards: [{ key: "overview-card" }], planDistribution: [], dailyViews: [], dailyMessages: [] },
    activation: { steps: [{ key: "activation-step" }], notes: [] },
    marketplace: {
        categories: [{ id: "cat-1" }],
        growthCategories: [],
        weakCategories: [],
        unsupportedSections: [],
    },
    operations: { cards: [{ key: "operations-card" }], bestResponders: [], slowResponders: [], dailyMessages: [] },
    monetization: { cards: [{ key: "monetization-card" }], planDistribution: [], upgradeCandidates: [], nearLimitAccounts: [] },
    qualityRisk: {
        cards: [{ key: "quality-card" }],
        productsWithoutImage: [],
        productsWithoutPrice: [],
        dormantCompanies: [],
        actionItems: [],
    },
    retention: {
        availability: {
            available: false,
        },
    },
    period: { from: "2026-04-09", to: "2026-04-15" },
    previousPeriod: { from: "2026-04-02", to: "2026-04-08" },
});

describe("useAdminPlatformAnalytics", () => {
    beforeEach(() => {
        getAdminPlatformAnalyticsMock.mockReset();
        useAuthMock.mockReset();
    });

    it("does not fetch when the current user is not a platform admin", async () => {
        useAuthMock.mockReturnValue({
            currentUser: {
                roles: [UserRole.REGULAR_USER],
            },
        });

        const { result } = renderHook(
            () =>
                useAdminPlatformAnalytics({
                    from: "2026-04-09",
                    to: "2026-04-15",
                }),
            {
                wrapper: createWrapper().wrapper,
            }
        );

        await waitFor(() => {
            expect(result.current.fetchStatus).toBe("idle");
        });

        expect(getAdminPlatformAnalyticsMock).not.toHaveBeenCalled();
    });

    it("does not fetch when roles are contaminated with ROLE_ADMIN but entitlements revoke platform admin access", async () => {
        useAuthMock.mockReturnValue({
            currentUser: {
                roles: [UserRole.ADMIN],
                entitlements: {
                    overrides: {
                        isPlatformAdmin: false,
                    },
                },
            },
        });

        const { result } = renderHook(
            () =>
                useAdminPlatformAnalytics({
                    from: "2026-04-09",
                    to: "2026-04-15",
                }),
            {
                wrapper: createWrapper().wrapper,
            }
        );

        await waitFor(() => {
            expect(result.current.fetchStatus).toBe("idle");
        });

        expect(getAdminPlatformAnalyticsMock).not.toHaveBeenCalled();
    });

    it("fetches when entitlements explicitly grant platform admin access", async () => {
        useAuthMock.mockReturnValue({
            currentUser: {
                roles: [UserRole.REGULAR_USER],
                entitlements: {
                    overrides: {
                        isPlatformAdmin: true,
                    },
                },
            },
        });

        getAdminPlatformAnalyticsMock.mockResolvedValue(createAnalyticsPayload());

        const { result } = renderHook(
            () =>
                useAdminPlatformAnalytics({
                    from: "2026-04-09",
                    to: "2026-04-15",
                }),
            {
                wrapper: createWrapper().wrapper,
            }
        );

        await waitFor(() => {
            expect(result.current.data?.homepage.callToActionHref).toBe("/dashboard/platform-analytics");
        });

        expect(getAdminPlatformAnalyticsMock).toHaveBeenCalledTimes(1);
    });

    it("reuses the same query cache for the detail hook and the homepage selector", async () => {
        useAuthMock.mockReturnValue({
            currentUser: {
                roles: [UserRole.ADMIN],
            },
        });

        getAdminPlatformAnalyticsMock.mockResolvedValue(createAnalyticsPayload());

        const { wrapper } = createWrapper();

        const detailHook = renderHook(
            () =>
                useAdminPlatformAnalytics({
                    from: "2026-04-09",
                    to: "2026-04-15",
                }),
            { wrapper }
        );

        await waitFor(() => {
            expect(detailHook.result.current.data?.homepage.callToActionHref).toBe("/dashboard/platform-analytics");
        });

        const homepageHook = renderHook(
            () =>
                useAdminPlatformHomepageAnalytics({
                    from: "2026-04-09",
                    to: "2026-04-15",
                }),
            { wrapper }
        );

        await waitFor(() => {
            expect(homepageHook.result.current.data?.callToActionHref).toBe("/dashboard/platform-analytics");
        });

        expect(getAdminPlatformAnalyticsMock).toHaveBeenCalledTimes(1);
    });

    it("returns each analytics slice from the shared detail payload", async () => {
        useAuthMock.mockReturnValue({
            currentUser: {
                roles: [UserRole.ADMIN],
            },
        });

        getAdminPlatformAnalyticsMock.mockResolvedValue(createAnalyticsPayload());

        const { wrapper } = createWrapper();

        const overviewHook = renderHook(() => useAdminPlatformOverview(), { wrapper });
        const activationHook = renderHook(() => useAdminPlatformActivation(), { wrapper });
        const marketplaceHook = renderHook(() => useAdminPlatformMarketplace(), { wrapper });
        const operationsHook = renderHook(() => useAdminPlatformOperations(), { wrapper });
        const monetizationHook = renderHook(() => useAdminPlatformMonetization(), { wrapper });
        const qualityRiskHook = renderHook(() => useAdminPlatformQualityRisk(), { wrapper });

        await waitFor(() => {
            expect(overviewHook.result.current.data?.cards[0]).toEqual({ key: "overview-card" });
            expect(activationHook.result.current.data?.steps[0]).toEqual({ key: "activation-step" });
            expect(marketplaceHook.result.current.data?.categories[0]).toEqual({ id: "cat-1" });
            expect(operationsHook.result.current.data?.cards[0]).toEqual({ key: "operations-card" });
            expect(monetizationHook.result.current.data?.cards[0]).toEqual({ key: "monetization-card" });
            expect(qualityRiskHook.result.current.data?.cards[0]).toEqual({ key: "quality-card" });
        });

        expect(getAdminPlatformAnalyticsMock).toHaveBeenCalledTimes(1);
        expect(getAdminPlatformAnalyticsMock).toHaveBeenCalledWith(undefined);
    });
});
