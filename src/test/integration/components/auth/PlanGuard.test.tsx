import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import PlanGuard from "@/components/auth/PlanGuard";
import { UserRole } from "@/domain/models/UserRole";

const useAuthMock = vi.fn();

vi.mock("@/context/AuthContext", () => ({
    useAuth: () => useAuthMock(),
}));

const renderGuard = (props: Omit<ComponentProps<typeof PlanGuard>, "children">) => {
    render(
        <PlanGuard {...props}>
            <div>contenido protegido</div>
        </PlanGuard>
    );
};

describe("PlanGuard", () => {
    beforeEach(() => {
        useAuthMock.mockReset();
    });

    it("shows company content when the required capability is enabled or read-only", () => {
        useAuthMock.mockReturnValue({
            currentUser: {
                id: "user-1",
                roles: [],
                companyContext: {
                    companyId: "company-1",
                    companyName: "Acme Rentals",
                    companyRole: "ROLE_ADMIN",
                    isCompanyOwner: true,
                    planType: "starter",
                    subscriptionStatus: "active",
                    isFoundingAccount: false,
                    entitlements: {
                        planType: "starter",
                        subscriptionStatus: "active",
                        quotas: {
                            activeProducts: 10,
                            teamMembers: 1,
                        },
                        capabilities: {
                            advancedAnalytics: { state: "read_only", limits: null },
                        },
                        overrides: {
                            isPlatformAdmin: false,
                            isCompanyOwner: true,
                            isCompanyAdmin: true,
                            isFoundingAccount: false,
                        },
                    },
                },
            },
            isLoading: false,
            hasRole: () => false,
        });

        renderGuard({
            requiredCompanyCapabilities: [{ key: "advancedAnalytics" }],
            fallback: <div>sin acceso</div>,
            requireCompanyContext: true,
        });

        expect(screen.getByText("contenido protegido")).toBeInTheDocument();
    });

    it("hides company content when the plan label looks premium but the capability is disabled", () => {
        useAuthMock.mockReturnValue({
            currentUser: {
                id: "user-2",
                roles: [],
                companyContext: {
                    companyId: "company-1",
                    companyName: "Acme Rentals",
                    companyRole: "ROLE_ADMIN",
                    isCompanyOwner: true,
                    planType: "pro",
                    subscriptionStatus: "active",
                    isFoundingAccount: false,
                    capabilities: {
                        advancedAnalytics: { state: "disabled", limits: null },
                    },
                },
            },
            isLoading: false,
            hasRole: () => false,
        });

        renderGuard({
            requiredCompanyCapabilities: [{ key: "advancedAnalytics" }],
            fallback: <div>sin acceso</div>,
            requireCompanyContext: true,
        });

        expect(screen.getByText("sin acceso")).toBeInTheDocument();
        expect(screen.queryByText("contenido protegido")).not.toBeInTheDocument();
    });

    it("uses user capabilities instead of the user plan label", () => {
        useAuthMock.mockReturnValue({
            currentUser: {
                id: "user-3",
                roles: [],
                planType: "explorer",
                subscriptionStatus: "active",
                entitlements: {
                    planType: "explorer",
                    subscriptionStatus: "active",
                    quotas: {
                        activeProducts: 2,
                        teamMembers: null,
                    },
                    capabilities: {
                        basicAnalytics: { state: "enabled", limits: null },
                    },
                    overrides: {
                        isPlatformAdmin: false,
                        isCompanyOwner: false,
                        isCompanyAdmin: false,
                        isFoundingAccount: false,
                    },
                },
            },
            isLoading: false,
            hasRole: () => false,
        });

        renderGuard({
            requiredUserCapabilities: [{ key: "basicAnalytics" }],
            fallback: <div>sin acceso</div>,
        });

        expect(screen.getByText("contenido protegido")).toBeInTheDocument();
    });

    it("always allows platform admins through", () => {
        useAuthMock.mockReturnValue({
            currentUser: {
                id: "admin-1",
                roles: [UserRole.ADMIN],
            },
            isLoading: false,
            hasRole: (role: UserRole) => role === UserRole.ADMIN,
        });

        renderGuard({
            requiredCompanyCapabilities: [{ key: "advancedAnalytics" }],
            fallback: <div>sin acceso</div>,
            requireCompanyContext: true,
        });

        expect(screen.getByText("contenido protegido")).toBeInTheDocument();
    });
});
