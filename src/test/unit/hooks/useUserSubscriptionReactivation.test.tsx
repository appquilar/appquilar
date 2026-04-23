import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    getUserSubscriptionReactivationErrorMessage,
    useUserSubscriptionReactivation,
} from "@/hooks/useUserSubscriptionReactivation";

const {
    useAuthMock,
    useReactivateSubscriptionMock,
    mutateAsyncMock,
    refreshCurrentUserMock,
} = vi.hoisted(() => ({
    useAuthMock: vi.fn(),
    useReactivateSubscriptionMock: vi.fn(),
    mutateAsyncMock: vi.fn(),
    refreshCurrentUserMock: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({
    useAuth: () => useAuthMock(),
}));

vi.mock("@/application/hooks/useBilling", () => ({
    useReactivateSubscription: () => useReactivateSubscriptionMock(),
}));

describe("useUserSubscriptionReactivation", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        refreshCurrentUserMock.mockResolvedValue(undefined);
        mutateAsyncMock.mockResolvedValue(undefined);
        useReactivateSubscriptionMock.mockReturnValue({
            mutateAsync: mutateAsyncMock,
            isPending: false,
        });
    });

    it("exposes reactivation only for active user_pro subscriptions pending cancellation and refreshes the current user after reactivating", async () => {
        useAuthMock.mockReturnValue({
            currentUser: {
                planType: "user_pro",
                subscriptionStatus: "active",
                subscriptionCancelAtPeriodEnd: true,
            },
            refreshCurrentUser: refreshCurrentUserMock,
        });

        const { result } = renderHook(() => useUserSubscriptionReactivation());

        expect(result.current.isReactivationAvailable).toBe(true);
        expect(result.current.isPending).toBe(false);

        await act(async () => {
            await result.current.reactivate();
        });

        expect(mutateAsyncMock).toHaveBeenCalledWith({
            scope: "user",
        });
        expect(refreshCurrentUserMock).toHaveBeenCalledTimes(1);
    });

    it("keeps reactivation unavailable for other plans or statuses", () => {
        useAuthMock.mockReturnValue({
            currentUser: {
                planType: "starter",
                subscriptionStatus: "canceled",
                subscriptionCancelAtPeriodEnd: true,
            },
            refreshCurrentUser: refreshCurrentUserMock,
        });
        useReactivateSubscriptionMock.mockReturnValue({
            mutateAsync: mutateAsyncMock,
            isPending: true,
        });

        const { result } = renderHook(() => useUserSubscriptionReactivation());

        expect(result.current.isReactivationAvailable).toBe(false);
        expect(result.current.isPending).toBe(true);
    });

    it("maps the specific backend reactivation code to a checkout-only message", () => {
        expect(
            getUserSubscriptionReactivationErrorMessage(
                {
                    payload: {
                        error: ["billing.subscription.reactivation_not_available"],
                    },
                },
                "Fallback"
            )
        ).toBe(
            "Esta suscripcion ya no puede mantenerse automaticamente. Inicia un nuevo checkout para volver a User Pro."
        );

        expect(
            getUserSubscriptionReactivationErrorMessage(
                {
                    payload: {
                        message: "No disponible",
                    },
                },
                "Fallback"
            )
        ).toBe("No disponible");
    });
});
