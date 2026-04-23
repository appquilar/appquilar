import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { UserRole } from "@/domain/models/UserRole";
import { useProductsManagement } from "@/components/dashboard/products/hooks/useProductsManagement";
import { DEFAULT_PRODUCT_PUBLICATION_STATUSES } from "@/domain/repositories/ProductRepository";

const navigateMock = vi.fn();
const useAuthMock = vi.fn();
const useDashboardProductsMock = vi.fn();
const useDeleteProductMock = vi.fn();
const usePublishProductMock = vi.fn();
const useActiveProductsCountMock = vi.fn();
const useCreateCheckoutSessionMock = vi.fn();
const useCreateCustomerPortalSessionMock = vi.fn();
const useUserProCheckoutMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

    return {
        ...actual,
        useNavigate: () => navigateMock,
    };
});

vi.mock("@/context/AuthContext", () => ({
    useAuth: () => useAuthMock(),
}));

vi.mock("@/application/hooks/useProducts", () => ({
    useDashboardProducts: (...args: unknown[]) => useDashboardProductsMock(...args),
    useDeleteProduct: (...args: unknown[]) => useDeleteProductMock(...args),
    usePublishProduct: (...args: unknown[]) => usePublishProductMock(...args),
    useActiveProductsCount: (...args: unknown[]) => useActiveProductsCountMock(...args),
}));

vi.mock("@/application/hooks/useBilling", () => ({
    useCreateCheckoutSession: (...args: unknown[]) => useCreateCheckoutSessionMock(...args),
    useCreateCustomerPortalSession: (...args: unknown[]) => useCreateCustomerPortalSessionMock(...args),
}));

vi.mock("@/hooks/useUserProCheckout", () => ({
    useUserProCheckout: (...args: unknown[]) => useUserProCheckoutMock(...args),
    getUserProCheckoutErrorMessage: (error: unknown, fallback: string) =>
        (error as { payload?: { message?: string } })?.payload?.message ?? fallback,
}));

vi.mock("sonner", () => ({
    toast: {
        error: (...args: unknown[]) => toastErrorMock(...args),
    },
}));

const createQueryResult = () => ({
    data: {
        data: [],
        total: 0,
    },
    error: null,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
});

const createMutationResult = () => ({
    mutateAsync: vi.fn(),
    isPending: false,
});

const createCurrentUser = (overrides: Record<string, unknown> = {}) => ({
    id: "user-1",
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@appquilar.test",
    roles: [UserRole.REGULAR_USER],
    planType: "explorer",
    subscriptionStatus: "active",
    productSlotLimit: 2,
    companyId: null,
    companyRole: null,
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
    ...overrides,
});

describe("useProductsManagement", () => {
    beforeEach(() => {
        navigateMock.mockReset();
        useAuthMock.mockReset();
        useDashboardProductsMock.mockReset();
        useDeleteProductMock.mockReset();
        usePublishProductMock.mockReset();
        useActiveProductsCountMock.mockReset();
        useCreateCheckoutSessionMock.mockReset();
        useCreateCustomerPortalSessionMock.mockReset();
        useUserProCheckoutMock.mockReset();
        toastErrorMock.mockReset();

        useDashboardProductsMock.mockReturnValue(createQueryResult());
        useDeleteProductMock.mockReturnValue(createMutationResult());
        usePublishProductMock.mockReturnValue(createMutationResult());
        useCreateCheckoutSessionMock.mockReturnValue(createMutationResult());
        useCreateCustomerPortalSessionMock.mockReturnValue(createMutationResult());
        useUserProCheckoutMock.mockReturnValue({
            isLoading: false,
            isCheckoutAvailable: true,
            unavailableMessage: null,
        });
        window.history.replaceState({}, "", "/dashboard/products?tab=all");
    });

    it("starts with draft and published selected by default", () => {
        useAuthMock.mockReturnValue({
            currentUser: createCurrentUser({ id: "user-default" }),
            isLoading: false,
        });
        useActiveProductsCountMock.mockReturnValue({ data: 0 });

        const { result } = renderHook(() => useProductsManagement());

        expect(result.current.filters.publicationStatus).toEqual(DEFAULT_PRODUCT_PUBLICATION_STATUSES);
        expect(result.current.defaultFilters.publicationStatus).toEqual(DEFAULT_PRODUCT_PUBLICATION_STATUSES);
    });

    it("keeps explorer users out of the admin path even with a contaminated ROLE_ADMIN payload", () => {
        useAuthMock.mockReturnValue({
            currentUser: createCurrentUser({
                roles: [UserRole.ADMIN],
            }),
            isLoading: false,
        });
        useActiveProductsCountMock.mockReturnValue({ data: 2 });

        const { result } = renderHook(() => useProductsManagement());

        expect(result.current.hasReachedProductPublicationLimit).toBe(true);
        expect(result.current.publicationLimitCtaLabel).toBe("Hazte Pro");
    });

    it("keeps platform admins exempt from publication limits", () => {
        useAuthMock.mockReturnValue({
            currentUser: createCurrentUser({
                id: "admin-1",
                roles: [UserRole.ADMIN],
                planType: "user_pro",
                productSlotLimit: null,
                entitlements: {
                    planType: "user_pro",
                    subscriptionStatus: "active",
                    quotas: {
                        activeProducts: null,
                        teamMembers: null,
                    },
                    capabilities: {},
                    overrides: {
                        isPlatformAdmin: true,
                        isCompanyOwner: false,
                        isCompanyAdmin: false,
                        isFoundingAccount: false,
                    },
                },
            }),
            isLoading: false,
        });
        useActiveProductsCountMock.mockReturnValue({ data: 999 });

        const { result } = renderHook(() => useProductsManagement());

        expect(result.current.hasReachedProductPublicationLimit).toBe(false);
        expect(result.current.publicationLimitCtaLabel).toBeNull();
    });

    it("treats company admins as company-scope users when platform admin access is revoked", () => {
        useAuthMock.mockReturnValue({
            currentUser: createCurrentUser({
                id: "user-2",
                roles: [UserRole.REGULAR_USER],
                companyId: "company-1",
                companyRole: "ROLE_ADMIN",
                planType: "user_pro",
                companyContext: {
                    companyId: "company-1",
                    companyName: "Herramientas Norte",
                    companyRole: "ROLE_ADMIN",
                    isCompanyOwner: true,
                    planType: "starter",
                    subscriptionStatus: "active",
                    isFoundingAccount: false,
                    productSlotLimit: 10,
                    capabilities: {},
                    entitlements: {
                        planType: "starter",
                        subscriptionStatus: "active",
                        quotas: {
                            activeProducts: 10,
                            teamMembers: 3,
                        },
                        capabilities: {},
                        overrides: {
                            isPlatformAdmin: false,
                            isCompanyOwner: true,
                            isCompanyAdmin: true,
                            isFoundingAccount: false,
                        },
                    },
                },
            }),
            isLoading: false,
        });
        useActiveProductsCountMock.mockReturnValue({ data: 10 });

        const { result } = renderHook(() => useProductsManagement());

        expect(result.current.hasReachedProductPublicationLimit).toBe(true);
        expect(result.current.publicationLimitCtaLabel).toBe("Hazte Pro");
    });

    it("does not offer company upgrade actions to contributors", () => {
        useAuthMock.mockReturnValue({
            currentUser: createCurrentUser({
                id: "user-3",
                roles: [UserRole.REGULAR_USER],
                companyId: "company-1",
                companyRole: "ROLE_CONTRIBUTOR",
                planType: "user_pro",
                companyContext: {
                    companyId: "company-1",
                    companyName: "Herramientas Norte",
                    companyRole: "ROLE_CONTRIBUTOR",
                    isCompanyOwner: false,
                    planType: "starter",
                    subscriptionStatus: "active",
                    isFoundingAccount: false,
                    productSlotLimit: 10,
                    capabilities: {},
                    entitlements: {
                        planType: "starter",
                        subscriptionStatus: "active",
                        quotas: {
                            activeProducts: 10,
                            teamMembers: 3,
                        },
                        capabilities: {},
                        overrides: {
                            isPlatformAdmin: false,
                            isCompanyOwner: false,
                            isCompanyAdmin: false,
                            isFoundingAccount: false,
                        },
                    },
                },
            }),
            isLoading: false,
        });
        useActiveProductsCountMock.mockReturnValue({ data: 10 });

        const { result } = renderHook(() => useProductsManagement());

        expect(result.current.hasReachedProductPublicationLimit).toBe(true);
        expect(result.current.publicationLimitCtaLabel).toBeNull();
    });

    it("creates a checkout session for explorer users who hit the publication limit", async () => {
        const originalLocation = window.location;
        const assignMock = vi.fn();
        Object.defineProperty(window, "location", {
            configurable: true,
            value: {
                ...originalLocation,
                assign: assignMock,
            },
        });
        const createCheckoutSession = vi.fn().mockResolvedValue({
            url: "https://billing.appquilar.test/checkout",
        });

        useAuthMock.mockReturnValue({
            currentUser: createCurrentUser(),
            isLoading: false,
        });
        useActiveProductsCountMock.mockReturnValue({ data: 2 });
        useCreateCheckoutSessionMock.mockReturnValue({
            mutateAsync: createCheckoutSession,
            isPending: false,
        });

        const { result } = renderHook(() => useProductsManagement());

        expect(result.current.publicationLimitCtaLabel).toBe("Hazte Pro");

        await act(async () => {
            await result.current.handlePublicationLimitCta();
        });

        expect(createCheckoutSession).toHaveBeenCalledTimes(1);
        const payload = createCheckoutSession.mock.calls[0][0];
        expect(payload.scope).toBe("user");
        expect(payload.planType).toBe("user_pro");
        expect(new URL(payload.successUrl).searchParams.get("aq_billing_scope")).toBe("user");
        expect(new URL(payload.successUrl).searchParams.get("aq_billing_plan")).toBe("user_pro");
        expect(new URL(payload.successUrl).searchParams.get("session_id")).toBe("{CHECKOUT_SESSION_ID}");
        expect(new URL(payload.cancelUrl).pathname).toBe("/dashboard/products");
        expect(assignMock).toHaveBeenCalledWith("https://billing.appquilar.test/checkout");

        Object.defineProperty(window, "location", {
            configurable: true,
            value: originalLocation,
        });
    });

    it("routes user-pro members to the company upgrade page when they hit the user limit", async () => {
        useAuthMock.mockReturnValue({
            currentUser: createCurrentUser({
                planType: "user_pro",
                productSlotLimit: 5,
                entitlements: {
                    planType: "user_pro",
                    subscriptionStatus: "active",
                    quotas: {
                        activeProducts: 5,
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
            }),
            isLoading: false,
        });
        useActiveProductsCountMock.mockReturnValue({ data: 5 });

        const { result } = renderHook(() => useProductsManagement());

        expect(result.current.publicationLimitCtaLabel).toBe("Hazte empresa");

        await act(async () => {
            await result.current.handlePublicationLimitCta();
        });

        expect(navigateMock).toHaveBeenCalledWith("/dashboard/upgrade");
    });

    it("shows a friendly message instead of starting checkout when user pro is unavailable", async () => {
        const createCheckoutSession = vi.fn();

        useAuthMock.mockReturnValue({
            currentUser: createCurrentUser(),
            isLoading: false,
        });
        useActiveProductsCountMock.mockReturnValue({ data: 2 });
        useCreateCheckoutSessionMock.mockReturnValue({
            mutateAsync: createCheckoutSession,
            isPending: false,
        });
        useUserProCheckoutMock.mockReturnValue({
            isLoading: false,
            isCheckoutAvailable: false,
            unavailableMessage: "User Pro todavia no esta configurado para checkout en Stripe.",
        });

        const { result } = renderHook(() => useProductsManagement());

        await act(async () => {
            await result.current.handlePublicationLimitCta();
        });

        expect(createCheckoutSession).not.toHaveBeenCalled();
        expect(toastErrorMock).toHaveBeenCalledWith(
            "User Pro todavia no esta configurado para checkout en Stripe."
        );
    });

    it("opens the customer portal for company admins and closes blocked or failed attempts cleanly", async () => {
        const newTab = {
            opener: "unsafe",
            location: { href: "" },
            close: vi.fn(),
        } as unknown as Window;
        const openSpy = vi.spyOn(window, "open").mockReturnValue(newTab);
        const createPortalSession = vi.fn().mockResolvedValue({
            url: "https://billing.appquilar.test/portal",
        });

        useAuthMock.mockReturnValue({
            currentUser: createCurrentUser({
                companyId: "company-1",
                companyRole: "ROLE_ADMIN",
                companyContext: {
                    companyId: "company-1",
                    companyName: "Herramientas Norte",
                    companyRole: "ROLE_ADMIN",
                    isCompanyOwner: true,
                    planType: "pro",
                    subscriptionStatus: "active",
                    isFoundingAccount: false,
                    productSlotLimit: 10,
                    capabilities: {},
                    entitlements: {
                        planType: "pro",
                        subscriptionStatus: "active",
                        quotas: {
                            activeProducts: 10,
                            teamMembers: 3,
                        },
                        capabilities: {},
                        overrides: {
                            isPlatformAdmin: false,
                            isCompanyOwner: true,
                            isCompanyAdmin: true,
                            isFoundingAccount: false,
                        },
                    },
                },
            }),
            isLoading: false,
        });
        useActiveProductsCountMock.mockReturnValue({ data: 10 });
        useCreateCustomerPortalSessionMock.mockReturnValue({
            mutateAsync: createPortalSession,
            isPending: false,
        });

        const { result } = renderHook(() => useProductsManagement());

        expect(result.current.publicationLimitCtaLabel).toBe("Hazte Enterprise");

        await act(async () => {
            await result.current.handlePublicationLimitCta();
        });

        expect(openSpy).toHaveBeenCalledWith("", "_blank");
        expect((newTab as { opener: unknown }).opener).toBeNull();
        expect(createPortalSession).toHaveBeenCalledWith(
            expect.objectContaining({
                scope: "company",
            })
        );
        const portalPayload = createPortalSession.mock.calls[0][0];
        const portalReturnUrl = new URL(portalPayload.returnUrl);
        expect(portalReturnUrl.searchParams.get("aq_billing_scope")).toBe("company");
        expect(portalReturnUrl.searchParams.get("aq_billing_current_plan")).toBe("pro");
        expect(portalReturnUrl.searchParams.get("aq_billing_current_status")).toBe("active");
        expect((newTab as { location: { href: string } }).location.href).toBe(
            "https://billing.appquilar.test/portal"
        );

        openSpy.mockRestore();
    });

    it("shows an error when a popup is blocked or the billing portal request fails", async () => {
        const openSpy = vi.spyOn(window, "open");
        const blockedPortalSession = vi.fn();
        const failingPortalSession = vi.fn().mockRejectedValue({
            payload: {
                message: "Portal no disponible",
            },
        });

        useAuthMock.mockReturnValue({
            currentUser: createCurrentUser({
                companyId: "company-1",
                companyRole: "ROLE_ADMIN",
                companyContext: {
                    companyId: "company-1",
                    companyName: "Herramientas Norte",
                    companyRole: "ROLE_ADMIN",
                    isCompanyOwner: true,
                    planType: "starter",
                    subscriptionStatus: "active",
                    isFoundingAccount: false,
                    productSlotLimit: 10,
                    capabilities: {},
                    entitlements: {
                        planType: "starter",
                        subscriptionStatus: "active",
                        quotas: {
                            activeProducts: 10,
                            teamMembers: 3,
                        },
                        capabilities: {},
                        overrides: {
                            isPlatformAdmin: false,
                            isCompanyOwner: true,
                            isCompanyAdmin: true,
                            isFoundingAccount: false,
                        },
                    },
                },
            }),
            isLoading: false,
        });
        useActiveProductsCountMock.mockReturnValue({ data: 10 });
        useCreateCustomerPortalSessionMock.mockReturnValue({
            mutateAsync: blockedPortalSession,
            isPending: false,
        });

        openSpy.mockReturnValueOnce(null);

        const { result } = renderHook(() => useProductsManagement());

        await act(async () => {
            await result.current.handlePublicationLimitCta();
        });

        expect(blockedPortalSession).not.toHaveBeenCalled();
        expect(toastErrorMock).toHaveBeenCalledWith(
            "No se pudo abrir una nueva pestana. Revisa el bloqueador de ventanas emergentes."
        );

        const newTab = {
            opener: null,
            location: { href: "" },
            close: vi.fn(),
        } as unknown as Window;

        useCreateCustomerPortalSessionMock.mockReturnValue({
            mutateAsync: failingPortalSession,
            isPending: false,
        });
        openSpy.mockReturnValueOnce(newTab);

        const { result: failureResult } = renderHook(() => useProductsManagement());

        await act(async () => {
            await failureResult.current.handlePublicationLimitCta();
        });

        expect((newTab as unknown as { close: ReturnType<typeof vi.fn> }).close).toHaveBeenCalledTimes(1);
        expect(toastErrorMock).toHaveBeenCalledWith("Portal no disponible");

        openSpy.mockRestore();
    });

    it("supports pagination, searching, publishing, editing and deleting products", async () => {
        const refetchMock = vi.fn().mockResolvedValue(undefined);
        const deleteMutation = vi.fn().mockResolvedValue(undefined);
        const publishMutation = vi.fn().mockResolvedValue(undefined);

        useAuthMock.mockReturnValue({
            currentUser: createCurrentUser(),
            isLoading: false,
        });
        useActiveProductsCountMock.mockReturnValue({ data: 1 });
        useDashboardProductsMock.mockReturnValue({
            data: {
                data: [
                    {
                        id: "product-1",
                        name: "Taladro",
                    },
                ],
                total: 24,
            },
            error: new Error("Productos no disponibles"),
            isLoading: false,
            isFetching: true,
            refetch: refetchMock,
        });
        useDeleteProductMock.mockReturnValue({
            mutateAsync: deleteMutation,
            isPending: false,
        });
        usePublishProductMock.mockReturnValue({
            mutateAsync: publishMutation,
            isPending: false,
        });

        const { result } = renderHook(() => useProductsManagement({ initialPage: 2, perPage: 10 }));

        expect(result.current.error).toBe("Productos no disponibles");
        expect(result.current.totalPages).toBe(3);
        expect(result.current.currentPage).toBe(2);
        expect(result.current.searchQuery).toBe("");
        expect(result.current.filteredProducts).toEqual([{ id: "product-1", name: "Taladro" }]);

        act(() => {
            result.current.handlePageChange(3);
        });
        expect(result.current.currentPage).toBe(3);

        act(() => {
            result.current.setSearchQuery("Taladro");
        });
        expect(result.current.searchQuery).toBe("Taladro");
        expect(result.current.currentPage).toBe(1);

        const preventDefault = vi.fn();
        act(() => {
            result.current.handleSearch({ preventDefault } as unknown as React.FormEvent);
            result.current.handleEditProduct("product-1");
            result.current.openDeleteModal("product-1", "Taladro");
        });

        expect(preventDefault).toHaveBeenCalledTimes(1);
        expect(navigateMock).toHaveBeenCalledWith("/dashboard/products/product-1");
        expect(result.current.isDeleteModalOpen).toBe(true);
        expect(result.current.productToDeleteId).toBe("product-1");
        expect(result.current.productToDeleteName).toBe("Taladro");

        await act(async () => {
            await result.current.handlePublishProduct("product-1");
        });

        expect(publishMutation).toHaveBeenCalledWith("product-1");
        expect(refetchMock).toHaveBeenCalledTimes(1);

        await act(async () => {
            await result.current.confirmDeleteProduct();
        });

        expect(deleteMutation).toHaveBeenCalledWith("product-1");
        expect(refetchMock).toHaveBeenCalledTimes(2);
        expect(result.current.isDeleteModalOpen).toBe(false);
        expect(result.current.productToDeleteId).toBeNull();
        expect(result.current.productToDeleteName).toBe("");

        await act(async () => {
            await result.current.confirmDeleteProduct();
        });

        expect(deleteMutation).toHaveBeenCalledTimes(1);
    });
});
