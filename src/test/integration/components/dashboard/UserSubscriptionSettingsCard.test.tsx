import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import UserSubscriptionSettingsCard from "@/components/dashboard/config/UserSubscriptionSettingsCard";
import { renderWithProviders } from "@/test/utils/renderWithProviders";
import { UserRole } from "@/domain/models/UserRole";

const toastErrorMock = vi.fn();
const toastSuccessMock = vi.fn();
const useAuthMock = vi.fn();
const useCreateCheckoutSessionMock = vi.fn();
const useCreateCustomerPortalSessionMock = vi.fn();
const useUserProCheckoutMock = vi.fn();
const useUserSubscriptionReactivationMock = vi.fn();

vi.mock("sonner", () => ({
    toast: {
        error: (...args: unknown[]) => toastErrorMock(...args),
        success: (...args: unknown[]) => toastSuccessMock(...args),
    },
}));

vi.mock("@/context/AuthContext", () => ({
    useAuth: () => useAuthMock(),
}));

vi.mock("@/application/hooks/useBilling", () => ({
    useCreateCheckoutSession: () => useCreateCheckoutSessionMock(),
    useCreateCustomerPortalSession: () => useCreateCustomerPortalSessionMock(),
}));

vi.mock("@/hooks/useUserProCheckout", () => ({
    useUserProCheckout: () => useUserProCheckoutMock(),
    getUserProCheckoutErrorMessage: (error: unknown, fallback: string) =>
        (error as { payload?: { message?: string } })?.payload?.message ?? fallback,
}));

vi.mock("@/hooks/useUserSubscriptionReactivation", () => ({
    useUserSubscriptionReactivation: () => useUserSubscriptionReactivationMock(),
    getUserSubscriptionReactivationErrorMessage: (
        error: unknown,
        fallback: string
    ) =>
        (error as { payload?: { message?: string } })?.payload?.message ?? fallback,
}));

describe("UserSubscriptionSettingsCard", () => {
    beforeEach(() => {
        toastErrorMock.mockReset();
        toastSuccessMock.mockReset();
        useAuthMock.mockReset();
        useCreateCheckoutSessionMock.mockReset();
        useCreateCustomerPortalSessionMock.mockReset();
        useUserProCheckoutMock.mockReset();
        useUserSubscriptionReactivationMock.mockReset();

        useAuthMock.mockReturnValue({
            currentUser: {
                id: "user-1",
                firstName: "Ada",
                lastName: "Lovelace",
                email: "ada@appquilar.test",
                roles: [UserRole.REGULAR_USER],
                address: null,
                location: null,
                companyId: null,
                companyContext: null,
                planType: "explorer",
                subscriptionStatus: "active",
            },
            hasRole: vi.fn().mockReturnValue(false),
        });

        useCreateCheckoutSessionMock.mockReturnValue({
            isPending: false,
            mutateAsync: vi.fn(),
        });

        useCreateCustomerPortalSessionMock.mockReturnValue({
            isPending: false,
            mutateAsync: vi.fn(),
        });

        useUserProCheckoutMock.mockReturnValue({
            isLoading: false,
            isCheckoutAvailable: true,
            unavailableMessage: null,
            userProPlan: null,
        });

        useUserSubscriptionReactivationMock.mockReturnValue({
            reactivate: vi.fn(),
            isPending: false,
            isReactivationAvailable: false,
        });

        window.history.replaceState({}, "", "/dashboard/config");
    });

    it("starts a new checkout when the user subscription is canceled", async () => {
        const originalLocation = window.location;
        const assignMock = vi.fn();
        const createCheckoutSession = vi.fn().mockResolvedValue({
            url: "https://billing.appquilar.test/checkout-user-pro",
        });

        Object.defineProperty(window, "location", {
            configurable: true,
            value: {
                ...originalLocation,
                assign: assignMock,
            },
        });

        useAuthMock.mockReturnValue({
            currentUser: {
                id: "user-1",
                firstName: "Ada",
                lastName: "Lovelace",
                email: "ada@appquilar.test",
                roles: [UserRole.REGULAR_USER],
                address: null,
                location: null,
                companyId: null,
                companyContext: null,
                planType: "explorer",
                subscriptionStatus: "canceled",
            },
            hasRole: vi.fn().mockReturnValue(false),
        });

        useCreateCheckoutSessionMock.mockReturnValue({
            isPending: false,
            mutateAsync: createCheckoutSession,
        });

        const user = userEvent.setup();
        renderWithProviders(<UserSubscriptionSettingsCard />, {
            route: "/dashboard/config",
        });

        expect(
            screen.getByRole("button", { name: "Reactivar User Pro" })
        ).toBeInTheDocument();

        await user.click(
            screen.getByRole("button", { name: "Reactivar User Pro" })
        );

        await waitFor(() => {
            expect(createCheckoutSession).toHaveBeenCalledWith(
                expect.objectContaining({
                    scope: "user",
                    planType: "user_pro",
                    successUrl: expect.stringContaining("aq_billing_plan=user_pro"),
                })
            );
            expect(assignMock).toHaveBeenCalledWith(
                "https://billing.appquilar.test/checkout-user-pro"
            );
        });

        Object.defineProperty(window, "location", {
            configurable: true,
            value: originalLocation,
        });
    });

    it("keeps sending paused subscriptions to the Stripe portal", async () => {
        const user = userEvent.setup();
        const openMock = vi.spyOn(window, "open");
        const mutateAsync = vi.fn().mockResolvedValue({
            url: "https://billing.appquilar.test/user-portal",
        });
        const openedTab = {
            opener: "parent-window",
            location: {
                href: "",
            },
            close: vi.fn(),
        } as unknown as Window;

        openMock.mockReturnValue(openedTab);
        useAuthMock.mockReturnValue({
            currentUser: {
                id: "user-1",
                firstName: "Ada",
                lastName: "Lovelace",
                email: "ada@appquilar.test",
                roles: [UserRole.REGULAR_USER],
                address: null,
                location: null,
                companyId: null,
                companyContext: null,
                planType: "explorer",
                subscriptionStatus: "paused",
            },
            hasRole: vi.fn().mockReturnValue(false),
        });
        useCreateCustomerPortalSessionMock.mockReturnValue({
            isPending: false,
            mutateAsync,
        });

        renderWithProviders(<UserSubscriptionSettingsCard />, {
            route: "/dashboard/config",
        });

        await user.click(
            screen.getByRole("button", { name: "Gestionar suscripcion" })
        );

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    scope: "user",
                    returnUrl: expect.stringContaining("aq_billing_scope=user"),
                })
            );
        });

        expect(openMock).toHaveBeenCalledWith("", "_blank");
        expect(openedTab.opener).toBeNull();
        expect(openedTab.location.href).toBe(
            "https://billing.appquilar.test/user-portal"
        );
    });

    it("lets the user keep User Pro when cancellation is scheduled at period end", async () => {
        const user = userEvent.setup();
        const reactivate = vi.fn().mockResolvedValue(undefined);

        useAuthMock.mockReturnValue({
            currentUser: {
                id: "user-1",
                firstName: "Ada",
                lastName: "Lovelace",
                email: "ada@appquilar.test",
                roles: [UserRole.REGULAR_USER],
                address: null,
                location: null,
                companyId: null,
                companyContext: null,
                planType: "user_pro",
                subscriptionStatus: "active",
                subscriptionCancelAtPeriodEnd: true,
            },
            hasRole: vi.fn().mockReturnValue(false),
        });
        useUserSubscriptionReactivationMock.mockReturnValue({
            reactivate,
            isPending: false,
            isReactivationAvailable: true,
        });

        renderWithProviders(<UserSubscriptionSettingsCard />, {
            route: "/dashboard/config",
        });

        expect(screen.getByText("Cancelacion programada")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Mantener User Pro" })
        ).toBeInTheDocument();

        await user.click(
            screen.getByRole("button", { name: "Mantener User Pro" })
        );

        await waitFor(() => {
            expect(reactivate).toHaveBeenCalledTimes(1);
            expect(toastSuccessMock).toHaveBeenCalledWith(
                "User Pro seguira activo al final del periodo."
            );
        });
    });
});
