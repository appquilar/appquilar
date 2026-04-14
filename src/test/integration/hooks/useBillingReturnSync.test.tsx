import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";

const {
    mockInvalidateQueries,
    mockUseAuth,
    mockBillingService,
} = vi.hoisted(() => ({
    mockInvalidateQueries: vi.fn(),
    mockUseAuth: vi.fn(),
    mockBillingService: {
        synchronizeCheckoutSession: vi.fn(),
    },
}));

vi.mock("@/compositionRoot", () => ({
    billingService: mockBillingService,
    queryClient: {
        invalidateQueries: mockInvalidateQueries,
    },
}));

vi.mock("@/context/AuthContext", () => ({
    useAuth: mockUseAuth,
}));

import {
    buildBillingBaseUrl,
    buildBillingCheckoutSuccessUrl,
    buildBillingReturnUrl,
    useBillingReturnSync,
} from "@/hooks/useBillingReturnSync";

const BillingSyncProbe = () => {
    useBillingReturnSync();
    const location = useLocation();

    return (
        <div data-testid="search">
            {location.search || "empty"}
        </div>
    );
};

describe("useBillingReturnSync", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        mockInvalidateQueries.mockReset();
        mockUseAuth.mockReset();
        mockBillingService.synchronizeCheckoutSession.mockReset();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("retries current user refresh until the paid user plan is active and then cleans billing params", async () => {
        const refreshCurrentUser = vi
            .fn()
            .mockResolvedValueOnce({
                planType: "explorer",
                subscriptionStatus: "active",
                companyContext: null,
            })
            .mockResolvedValueOnce({
                planType: "user_pro",
                subscriptionStatus: "active",
                companyContext: null,
            });

        mockUseAuth.mockReturnValue({
            currentUser: {
                planType: "explorer",
                subscriptionStatus: "active",
                companyContext: null,
            },
            refreshCurrentUser,
            isAuthenticated: true,
        });

        render(
            <MemoryRouter
                initialEntries={[
                    "/dashboard/config?foo=bar&aq_billing_sync=1&aq_billing_scope=user&aq_billing_plan=user_pro",
                ]}
            >
                <Routes>
                    <Route path="/dashboard/config" element={<BillingSyncProbe />} />
                </Routes>
            </MemoryRouter>
        );

        await act(async () => {
            await Promise.resolve();
        });

        expect(refreshCurrentUser).toHaveBeenCalledTimes(1);
        expect(mockBillingService.synchronizeCheckoutSession).not.toHaveBeenCalled();

        await act(async () => {
            await vi.advanceTimersByTimeAsync(1500);
        });

        await act(async () => {
            await Promise.resolve();
        });

        expect(refreshCurrentUser).toHaveBeenCalledTimes(2);
        expect(mockInvalidateQueries).toHaveBeenCalledTimes(2);
        expect(screen.getByTestId("search")).toHaveTextContent("?foo=bar");
    });

    it("refreshes once on customer portal return even when no plan is provided", async () => {
        const refreshCurrentUser = vi.fn().mockResolvedValue({
            planType: "user_pro",
            subscriptionStatus: "active",
            companyContext: null,
        });

        mockUseAuth.mockReturnValue({
            currentUser: {
                planType: "user_pro",
                subscriptionStatus: "active",
                companyContext: null,
            },
            refreshCurrentUser,
            isAuthenticated: true,
        });

        render(
            <MemoryRouter
                initialEntries={[
                    "/dashboard/config?aq_billing_sync=1&aq_billing_scope=user",
                ]}
            >
                <Routes>
                    <Route path="/dashboard/config" element={<BillingSyncProbe />} />
                </Routes>
            </MemoryRouter>
        );

        await act(async () => {
            await Promise.resolve();
        });

        expect(refreshCurrentUser).toHaveBeenCalledTimes(1);
        expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId("search")).toHaveTextContent("empty");
    });

    it("synchronizes checkout session before refreshing the current user when session_id is present", async () => {
        const refreshCurrentUser = vi.fn().mockResolvedValue({
            planType: "user_pro",
            subscriptionStatus: "active",
            companyContext: null,
        });

        mockBillingService.synchronizeCheckoutSession.mockResolvedValue({
            synchronized: true,
        });

        mockUseAuth.mockReturnValue({
            currentUser: {
                planType: "explorer",
                subscriptionStatus: "active",
                companyContext: null,
            },
            refreshCurrentUser,
            isAuthenticated: true,
        });

        render(
            <MemoryRouter
                initialEntries={[
                    "/dashboard/config?aq_billing_sync=1&aq_billing_scope=user&aq_billing_plan=user_pro&session_id=cs_test_123",
                ]}
            >
                <Routes>
                    <Route path="/dashboard/config" element={<BillingSyncProbe />} />
                </Routes>
            </MemoryRouter>
        );

        await act(async () => {
            await Promise.resolve();
        });

        expect(mockBillingService.synchronizeCheckoutSession).toHaveBeenCalledWith({
            scope: "user",
            sessionId: "cs_test_123",
        });
        expect(refreshCurrentUser).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId("search")).toHaveTextContent("empty");
    });

    it("builds billing return urls without duplicating sync params", () => {
        const baseUrl = buildBillingBaseUrl(
            "https://appquilar.com/dashboard/config?aq_billing_sync=1&aq_billing_scope=user&session_id=cs_old&foo=bar"
        );
        const billingReturnUrl = buildBillingReturnUrl(baseUrl, "company", "pro");
        const checkoutSuccessUrl = buildBillingCheckoutSuccessUrl(baseUrl, "user", "user_pro");

        expect(baseUrl).toBe("https://appquilar.com/dashboard/config?foo=bar");
        expect(billingReturnUrl).toBe(
            "https://appquilar.com/dashboard/config?foo=bar&aq_billing_sync=1&aq_billing_scope=company&aq_billing_plan=pro"
        );
        expect(checkoutSuccessUrl).toBe(
            "https://appquilar.com/dashboard/config?foo=bar&aq_billing_sync=1&aq_billing_scope=user&aq_billing_plan=user_pro&session_id=%7BCHECKOUT_SESSION_ID%7D"
        );
    });
});
