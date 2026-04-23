import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
    MemoryRouter,
    Routes,
    Route,
    useLocation,
    useNavigate,
} from "react-router-dom";

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
    buildBillingPortalReturnUrl,
    buildBillingReturnUrl,
    useBillingReturnSync,
} from "@/hooks/useBillingReturnSync";

const BillingSyncProbe = () => {
    useBillingReturnSync();
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <>
            <div data-testid="pathname">{location.pathname}</div>
            <div data-testid="search">
                {location.search || "empty"}
            </div>
            <button onClick={() => navigate("/dashboard/products")}>
                go-products
            </button>
        </>
    );
};

describe("useBillingReturnSync", () => {
    let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
    let localStorageSetItemSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        vi.useFakeTimers();
        window.sessionStorage.clear();
        window.localStorage.clear();
        mockInvalidateQueries.mockReset();
        mockUseAuth.mockReset();
        mockBillingService.synchronizeCheckoutSession.mockReset();
        consoleWarnSpy = vi
            .spyOn(console, "warn")
            .mockImplementation(() => undefined);
        localStorageSetItemSpy = vi.spyOn(window.localStorage.__proto__, "setItem");
    });

    afterEach(() => {
        window.sessionStorage.clear();
        window.localStorage.clear();
        localStorageSetItemSpy.mockRestore();
        consoleWarnSpy.mockRestore();
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
        expect(localStorageSetItemSpy).toHaveBeenCalledWith(
            "appquilar:billing:return-sync-completed",
            expect.any(String)
        );
    });

    it("continues retrying when auth state rerenders during the billing return flow", async () => {
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

        let authValue = {
            currentUser: {
                planType: "explorer",
                subscriptionStatus: "active",
                companyContext: null,
            },
            refreshCurrentUser,
            isAuthenticated: true,
        };

        mockUseAuth.mockImplementation(() => authValue);

        const view = render(
            <MemoryRouter
                initialEntries={[
                    "/dashboard/config?aq_billing_sync=1&aq_billing_scope=user&aq_billing_plan=user_pro",
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

        authValue = {
            ...authValue,
            currentUser: {
                planType: "explorer",
                subscriptionStatus: "active",
                companyContext: null,
            },
        };

        view.rerender(
            <MemoryRouter
                initialEntries={[
                    "/dashboard/config?aq_billing_sync=1&aq_billing_scope=user&aq_billing_plan=user_pro",
                ]}
            >
                <Routes>
                    <Route path="/dashboard/config" element={<BillingSyncProbe />} />
                </Routes>
            </MemoryRouter>
        );

        await act(async () => {
            await vi.advanceTimersByTimeAsync(1500);
        });

        await act(async () => {
            await Promise.resolve();
        });

        expect(refreshCurrentUser).toHaveBeenCalledTimes(2);
        expect(mockInvalidateQueries).toHaveBeenCalledTimes(2);
        expect(screen.getByTestId("search")).toHaveTextContent("empty");
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

    it("retries customer portal return refreshes until the subscription state changes", async () => {
        const refreshCurrentUser = vi
            .fn()
            .mockResolvedValueOnce({
                planType: "user_pro",
                subscriptionStatus: "active",
                companyContext: null,
            })
            .mockResolvedValueOnce({
                planType: "explorer",
                subscriptionStatus: "canceled",
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
                    "/dashboard/config?aq_billing_sync=1&aq_billing_scope=user&aq_billing_current_plan=user_pro&aq_billing_current_status=active",
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
        expect(screen.getByTestId("search")).toHaveTextContent(
            "?aq_billing_sync=1&aq_billing_scope=user&aq_billing_current_plan=user_pro&aq_billing_current_status=active"
        );

        await act(async () => {
            await vi.advanceTimersByTimeAsync(1500);
        });

        await act(async () => {
            await Promise.resolve();
        });

        expect(refreshCurrentUser).toHaveBeenCalledTimes(2);
        expect(mockInvalidateQueries).toHaveBeenCalledTimes(2);
        expect(screen.getByTestId("search")).toHaveTextContent("empty");
    });

    it("detects scheduled cancellation changes even when plan and status stay active", async () => {
        const refreshCurrentUser = vi
            .fn()
            .mockResolvedValueOnce({
                planType: "user_pro",
                subscriptionStatus: "active",
                subscriptionCancelAtPeriodEnd: false,
                companyContext: null,
            })
            .mockResolvedValueOnce({
                planType: "user_pro",
                subscriptionStatus: "active",
                subscriptionCancelAtPeriodEnd: true,
                companyContext: null,
            });

        mockUseAuth.mockReturnValue({
            currentUser: {
                planType: "user_pro",
                subscriptionStatus: "active",
                subscriptionCancelAtPeriodEnd: false,
                companyContext: null,
            },
            refreshCurrentUser,
            isAuthenticated: true,
        });

        render(
            <MemoryRouter
                initialEntries={[
                    "/dashboard/config?aq_billing_sync=1&aq_billing_scope=user&aq_billing_current_plan=user_pro&aq_billing_current_status=active&aq_billing_current_cancel_at_period_end=0",
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

        await act(async () => {
            await vi.advanceTimersByTimeAsync(1500);
        });

        await act(async () => {
            await Promise.resolve();
        });

        expect(refreshCurrentUser).toHaveBeenCalledTimes(2);
        expect(mockInvalidateQueries).toHaveBeenCalledTimes(2);
        expect(screen.getByTestId("search")).toHaveTextContent("empty");
    });

    it("keeps syncing after navigating to another dashboard route before the subscription state changes", async () => {
        const refreshCurrentUser = vi
            .fn()
            .mockResolvedValueOnce({
                planType: "user_pro",
                subscriptionStatus: "active",
                companyContext: null,
            })
            .mockResolvedValueOnce({
                planType: "explorer",
                subscriptionStatus: "canceled",
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
                    "/dashboard/config?aq_billing_sync=1&aq_billing_scope=user&aq_billing_current_plan=user_pro&aq_billing_current_status=active",
                ]}
            >
                <Routes>
                    <Route path="/dashboard/config" element={<BillingSyncProbe />} />
                    <Route path="/dashboard/products" element={<BillingSyncProbe />} />
                </Routes>
            </MemoryRouter>
        );

        await act(async () => {
            await Promise.resolve();
        });

        expect(refreshCurrentUser).toHaveBeenCalledTimes(1);

        await act(async () => {
            screen.getByRole("button", { name: "go-products" }).click();
        });

        expect(screen.getByTestId("pathname")).toHaveTextContent(
            "/dashboard/products"
        );
        expect(screen.getByTestId("search")).toHaveTextContent("empty");

        await act(async () => {
            await vi.advanceTimersByTimeAsync(1500);
        });

        await act(async () => {
            await Promise.resolve();
        });

        expect(refreshCurrentUser).toHaveBeenCalledTimes(2);
        expect(mockInvalidateQueries).toHaveBeenCalledTimes(2);
        expect(screen.getByTestId("pathname")).toHaveTextContent(
            "/dashboard/products"
        );
        expect(screen.getByTestId("search")).toHaveTextContent("empty");
    });

    it("keeps the billing return pending after the first retry window expires and the url is cleaned", async () => {
        const activeSnapshot = {
            planType: "user_pro",
            subscriptionStatus: "active",
            companyContext: null,
        };
        const canceledSnapshot = {
            planType: "explorer",
            subscriptionStatus: "canceled",
            companyContext: null,
        };
        const refreshCurrentUser = vi.fn();

        for (let attempt = 0; attempt < 12; attempt += 1) {
            refreshCurrentUser.mockResolvedValueOnce(activeSnapshot);
        }
        refreshCurrentUser.mockResolvedValueOnce(canceledSnapshot);

        mockUseAuth.mockReturnValue({
            currentUser: activeSnapshot,
            refreshCurrentUser,
            isAuthenticated: true,
        });

        render(
            <MemoryRouter
                initialEntries={[
                    "/dashboard/config?aq_billing_sync=1&aq_billing_scope=user&aq_billing_current_plan=user_pro&aq_billing_current_status=active",
                ]}
            >
                <Routes>
                    <Route path="/dashboard/config" element={<BillingSyncProbe />} />
                    <Route path="/dashboard/products" element={<BillingSyncProbe />} />
                </Routes>
            </MemoryRouter>
        );

        await act(async () => {
            await Promise.resolve();
        });

        await act(async () => {
            await vi.advanceTimersByTimeAsync(11 * 1500);
        });

        await act(async () => {
            await Promise.resolve();
        });

        expect(refreshCurrentUser).toHaveBeenCalledTimes(13);
        expect(screen.getByTestId("pathname")).toHaveTextContent(
            "/dashboard/config"
        );
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

    it("keeps retrying current user refresh when checkout synchronization fails transiently", async () => {
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

        mockBillingService.synchronizeCheckoutSession.mockRejectedValueOnce(
            new Error("sync failed")
        );

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
                    "/dashboard/config?foo=bar&aq_billing_sync=1&aq_billing_scope=user&aq_billing_plan=user_pro&session_id=cs_test_123",
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
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(refreshCurrentUser).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId("search")).toHaveTextContent(
            "?foo=bar&aq_billing_sync=1&aq_billing_scope=user&aq_billing_plan=user_pro&session_id=cs_test_123"
        );

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

    it("refreshes the current user when another dashboard tab completes a billing sync", async () => {
        const refreshCurrentUser = vi.fn().mockResolvedValue({
            planType: "explorer",
            subscriptionStatus: "canceled",
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
            <MemoryRouter initialEntries={["/dashboard/products"]}>
                <Routes>
                    <Route path="/dashboard/products" element={<BillingSyncProbe />} />
                </Routes>
            </MemoryRouter>
        );

        await act(async () => {
            window.dispatchEvent(
                new StorageEvent("storage", {
                    key: "appquilar:billing:return-sync-completed",
                    newValue: JSON.stringify({
                        scope: "user",
                        completedAtMs: Date.now(),
                    }),
                })
            );
            await Promise.resolve();
        });

        expect(refreshCurrentUser).toHaveBeenCalledTimes(1);
    });

    it("builds billing return urls without duplicating sync params", () => {
        const baseUrl = buildBillingBaseUrl(
            "https://appquilar.com/dashboard/config?aq_billing_sync=1&aq_billing_scope=user&session_id=cs_old&foo=bar"
        );
        const billingReturnUrl = buildBillingReturnUrl(baseUrl, "company", "pro");
        const billingPortalReturnUrl = buildBillingPortalReturnUrl(baseUrl, "company", {
            planType: "pro",
            subscriptionStatus: "active",
            subscriptionCancelAtPeriodEnd: false,
        });
        const checkoutSuccessUrl = buildBillingCheckoutSuccessUrl(baseUrl, "user", "user_pro");

        expect(baseUrl).toBe("https://appquilar.com/dashboard/config?foo=bar");
        expect(billingReturnUrl).toBe(
            "https://appquilar.com/dashboard/config?foo=bar&aq_billing_sync=1&aq_billing_scope=company&aq_billing_plan=pro"
        );
        expect(billingPortalReturnUrl).toBe(
            "https://appquilar.com/dashboard/config?foo=bar&aq_billing_sync=1&aq_billing_scope=company&aq_billing_current_plan=pro&aq_billing_current_status=active&aq_billing_current_cancel_at_period_end=0"
        );
        expect(checkoutSuccessUrl).toBe(
            "https://appquilar.com/dashboard/config?foo=bar&aq_billing_sync=1&aq_billing_scope=user&aq_billing_plan=user_pro&session_id=%7BCHECKOUT_SESSION_ID%7D"
        );
    });
});
