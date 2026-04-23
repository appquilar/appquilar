import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";

import DashboardOverview from "@/components/dashboard/overview/DashboardOverview";
import { renderWithProviders } from "@/test/utils/renderWithProviders";

const useAuthMock = vi.fn();
const useCompanyEngagementStatsMock = vi.fn();
const useUserEngagementStatsMock = vi.fn();
const useCreateCheckoutSessionMock = vi.fn();
const useActiveProductsCountMock = vi.fn();
const useUserProCheckoutMock = vi.fn();

vi.mock("@/context/AuthContext", () => ({
    useAuth: () => useAuthMock(),
}));

vi.mock("@/application/hooks/useCompanyEngagementStats", () => ({
    useCompanyEngagementStats: (...args: unknown[]) => useCompanyEngagementStatsMock(...args),
}));

vi.mock("@/application/hooks/useUserEngagementStats", () => ({
    useUserEngagementStats: (...args: unknown[]) => useUserEngagementStatsMock(...args),
}));

vi.mock("@/application/hooks/useBilling", () => ({
    useCreateCheckoutSession: (...args: unknown[]) => useCreateCheckoutSessionMock(...args),
}));

vi.mock("@/application/hooks/useProducts", () => ({
    useActiveProductsCount: (...args: unknown[]) => useActiveProductsCountMock(...args),
}));

vi.mock("@/hooks/useUserProCheckout", () => ({
    useUserProCheckout: (...args: unknown[]) => useUserProCheckoutMock(...args),
    getUserProCheckoutErrorMessage: (_error: unknown, fallback: string) => fallback,
}));

vi.mock("@/components/dashboard/common/DashboardSectionHeader", () => ({
    default: ({ title, description }: { title: string; description?: string }) => (
        <div>
            <h1>{title}</h1>
            {description ? <p>{description}</p> : null}
        </div>
    ),
}));

vi.mock("@/components/dashboard/stats/EngagementLineChart", () => ({
    default: () => <div data-testid="engagement-chart" />,
}));

vi.mock("@/components/dashboard/stats/CompanyAdvancedStatsPremium", () => ({
    CompanyAdvancedStatsPremium: () => <div data-testid="premium-advanced-stats" />,
}));

vi.mock("@/components/dashboard/analytics/AdminPlatformAnalyticsHomeSection", () => ({
    default: () => <div data-testid="platform-analytics-home" />,
}));

describe("DashboardOverview", () => {
    beforeEach(() => {
        useAuthMock.mockReset();
        useCompanyEngagementStatsMock.mockReset();
        useUserEngagementStatsMock.mockReset();
        useCreateCheckoutSessionMock.mockReset();
        useActiveProductsCountMock.mockReset();
        useUserProCheckoutMock.mockReset();

        useCompanyEngagementStatsMock.mockReturnValue({
            data: null,
            isLoading: false,
            error: null,
        });
        useUserEngagementStatsMock.mockReturnValue({
            data: null,
            isLoading: false,
            error: null,
        });
        useCreateCheckoutSessionMock.mockReturnValue({
            mutateAsync: vi.fn(),
            isPending: false,
        });
        useUserProCheckoutMock.mockReturnValue({
            isLoading: false,
            isCheckoutAvailable: true,
            unavailableMessage: null,
        });
    });

    it("counts active products for explorer users with their user id instead of leaving ownerId empty", () => {
        useAuthMock.mockReturnValue({
            currentUser: {
                id: "user-1",
                planType: "explorer",
                subscriptionStatus: "active",
                productSlotLimit: 2,
                entitlements: {
                    planType: "explorer",
                    subscriptionStatus: "active",
                    quotas: {
                        activeProducts: 2,
                        teamMembers: null,
                    },
                    capabilities: {},
                    overrides: {
                        isPlatformAdmin: false,
                        isCompanyOwner: false,
                        isCompanyAdmin: false,
                        isFoundingAccount: false,
                    },
                },
                companyContext: null,
            },
            hasRole: () => false,
        });
        useActiveProductsCountMock.mockReturnValue({
            data: 1,
            isLoading: false,
            error: null,
        });

        renderWithProviders(<DashboardOverview />);

        expect(useActiveProductsCountMock).toHaveBeenCalledWith({
            ownerId: "user-1",
            ownerType: "user",
        });
        expect(screen.getByText("1 de 2 productos publicados")).toBeInTheDocument();
    });
});
