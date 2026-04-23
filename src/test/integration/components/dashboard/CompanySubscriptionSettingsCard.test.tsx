import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CompanySubscriptionSettingsCard from "@/components/dashboard/companies/CompanySubscriptionSettingsCard";
import { renderWithProviders } from "@/test/utils/renderWithProviders";
import { UserRole } from "@/domain/models/UserRole";

const toastErrorMock = vi.fn();
const toastSuccessMock = vi.fn();
const useAuthMock = vi.fn();
const useCreateCustomerPortalSessionMock = vi.fn();
const useMigrateCompanyToExplorerMock = vi.fn();
const useCompanyUsersMock = vi.fn();

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
    useCreateCustomerPortalSession: () => useCreateCustomerPortalSessionMock(),
    useMigrateCompanyToExplorer: () => useMigrateCompanyToExplorerMock(),
}));

vi.mock("@/application/hooks/useCompanyMembership", () => ({
    useCompanyUsers: (...args: unknown[]) => useCompanyUsersMock(...args),
}));

describe("CompanySubscriptionSettingsCard", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        toastErrorMock.mockReset();
        toastSuccessMock.mockReset();
        useAuthMock.mockReset();
        useCreateCustomerPortalSessionMock.mockReset();
        useMigrateCompanyToExplorerMock.mockReset();
        useCompanyUsersMock.mockReset();

        useAuthMock.mockReturnValue({
            currentUser: {
                id: "user-1",
                firstName: "Ada",
                lastName: "Lovelace",
                email: "ada@appquilar.test",
                roles: [UserRole.REGULAR_USER],
                address: null,
                location: null,
                companyContext: {
                    companyId: "company-1",
                    companyName: "Acme",
                    companyRole: "ROLE_ADMIN",
                    isCompanyOwner: true,
                    planType: "early_bird",
                    subscriptionStatus: "active",
                    isFoundingAccount: true,
                    productSlotLimit: null,
                    capabilities: null,
                    entitlements: null,
                },
            },
            refreshCurrentUser: vi.fn(),
            hasRole: vi.fn().mockReturnValue(false),
        });

        useCreateCustomerPortalSessionMock.mockReturnValue({
            isPending: false,
            mutateAsync: vi.fn(),
        });

        useMigrateCompanyToExplorerMock.mockReturnValue({
            isPending: false,
            mutateAsync: vi.fn(),
        });

        useCompanyUsersMock.mockReturnValue({
            data: [],
            isLoading: false,
        });
    });

    it("shows the Early Bird plan once and labels the founding flag separately", () => {
        renderWithProviders(<CompanySubscriptionSettingsCard />);

        expect(screen.getByText("Suscripcion de empresa")).toBeInTheDocument();
        expect(screen.getAllByText("Early Bird")).toHaveLength(1);
        expect(screen.getByText("Cuenta fundadora")).toBeInTheDocument();
        expect(screen.getByText("Activa")).toBeInTheDocument();
    });

    it("does not render for platform admins", () => {
        useAuthMock.mockReturnValue({
            currentUser: {
                companyContext: {
                    companyId: "company-1",
                    companyName: "Acme",
                    companyRole: "ROLE_ADMIN",
                    isCompanyOwner: true,
                    planType: "starter",
                    subscriptionStatus: "active",
                    isFoundingAccount: false,
                    productSlotLimit: null,
                    capabilities: null,
                    entitlements: null,
                },
                roles: [UserRole.ADMIN],
            },
            refreshCurrentUser: vi.fn(),
            hasRole: vi.fn().mockReturnValue(true),
        });

        const { container } = renderWithProviders(<CompanySubscriptionSettingsCard />);

        expect(container).toBeEmptyDOMElement();
    });

    it("opens the billing portal in a new tab", async () => {
        const user = userEvent.setup();
        const openMock = vi.spyOn(window, "open");
        const mutateAsync = vi.fn().mockResolvedValue({
            url: "https://billing.appquilar.test/session",
        });
        const openedTab = {
            opener: "parent-window",
            location: {
                href: "",
            },
            close: vi.fn(),
        } as unknown as Window;

        openMock.mockReturnValue(openedTab);
        useCreateCustomerPortalSessionMock.mockReturnValue({
            isPending: false,
            mutateAsync,
        });

        renderWithProviders(<CompanySubscriptionSettingsCard />);

        await user.click(screen.getByRole("button", { name: "Gestionar suscripcion" }));

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    scope: "company",
                    returnUrl: expect.stringContaining("aq_billing_scope=company"),
                })
            );
        });

        expect(openMock).toHaveBeenCalledWith("", "_blank");
        expect(openedTab.opener).toBeNull();
        expect(openedTab.location.href).toBe("https://billing.appquilar.test/session");
    });

    it("shows a toast when the billing portal cannot be opened", async () => {
        const user = userEvent.setup();
        const openMock = vi.spyOn(window, "open").mockReturnValue(null);
        const mutateAsync = vi.fn();

        useCreateCustomerPortalSessionMock.mockReturnValue({
            isPending: false,
            mutateAsync,
        });

        renderWithProviders(<CompanySubscriptionSettingsCard />);

        await user.click(screen.getByRole("button", { name: "Gestionar suscripcion" }));

        expect(openMock).toHaveBeenCalledWith("", "_blank");
        expect(mutateAsync).not.toHaveBeenCalled();
        expect(toastErrorMock).toHaveBeenCalledWith(
            "No se pudo abrir una nueva pestana. Revisa el bloqueador de ventanas emergentes."
        );
    });

    it("migrates a canceled company to explorer mode after confirmation", async () => {
        const user = userEvent.setup();
        const refreshCurrentUser = vi.fn().mockResolvedValue(undefined);
        const mutateAsync = vi.fn().mockResolvedValue(undefined);
        const confirmMock = vi.spyOn(window, "confirm").mockReturnValue(true);

        useAuthMock.mockReturnValue({
            currentUser: {
                id: "user-1",
                firstName: "Ada",
                lastName: "Lovelace",
                email: "ada@appquilar.test",
                roles: [UserRole.REGULAR_USER],
                address: null,
                location: null,
                companyContext: {
                    companyId: "company-1",
                    companyName: "Acme",
                    companyRole: "ROLE_ADMIN",
                    isCompanyOwner: true,
                    planType: "starter",
                    subscriptionStatus: "canceled",
                    isFoundingAccount: false,
                    productSlotLimit: null,
                    capabilities: null,
                    entitlements: null,
                },
            },
            refreshCurrentUser,
            hasRole: vi.fn().mockReturnValue(false),
        });

        useCompanyUsersMock.mockReturnValue({
            data: [
                {
                    userId: "owner-user-1",
                    email: "owner@appquilar.test",
                    role: "ROLE_ADMIN",
                    status: "ACCEPTED",
                },
            ],
            isLoading: false,
        });
        useMigrateCompanyToExplorerMock.mockReturnValue({
            isPending: false,
            mutateAsync,
        });

        renderWithProviders(<CompanySubscriptionSettingsCard />);

        expect(screen.getByText("La suscripcion de empresa esta cancelada")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Migrar a Explorador" }));

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalledWith({
                targetOwnerUserId: "owner-user-1",
                confirm: true,
            });
        });

        expect(confirmMock).toHaveBeenCalled();
        expect(refreshCurrentUser).toHaveBeenCalled();
        expect(toastSuccessMock).toHaveBeenCalledWith("Empresa migrada a modo Explorador.");
    });

    it("shows paused-company guidance and lets admins choose the owner that keeps the assets", async () => {
        useAuthMock.mockReturnValue({
            currentUser: {
                id: "user-1",
                firstName: "Ada",
                lastName: "Lovelace",
                email: "ada@appquilar.test",
                roles: [UserRole.REGULAR_USER],
                address: null,
                location: null,
                companyContext: {
                    companyId: "company-1",
                    companyName: "Acme",
                    companyRole: "ROLE_ADMIN",
                    isCompanyOwner: true,
                    planType: "starter",
                    subscriptionStatus: "paused",
                    isFoundingAccount: false,
                    productSlotLimit: null,
                    capabilities: null,
                    entitlements: null,
                },
            },
            refreshCurrentUser: vi.fn(),
            hasRole: vi.fn().mockReturnValue(false),
        });

        useCompanyUsersMock.mockReturnValue({
            data: [
                {
                    userId: "owner-user-1",
                    email: "owner-1@appquilar.test",
                    role: "ROLE_ADMIN",
                    status: "ACCEPTED",
                },
                {
                    userId: "owner-user-2",
                    email: "owner-2@appquilar.test",
                    role: "ROLE_ADMIN",
                    status: "ACCEPTED",
                },
            ],
            isLoading: false,
        });

        renderWithProviders(<CompanySubscriptionSettingsCard />);

        expect(screen.getByText("Hay un problema con el cobro de la suscripcion")).toBeInTheDocument();
        expect(screen.getByText("Usuario que conservara la propiedad")).toBeInTheDocument();
        expect(screen.getByText("owner-1@appquilar.test")).toBeInTheDocument();
    });

    it("stops when migration is cancelled and surfaces backend errors when migration fails", async () => {
        const user = userEvent.setup();
        const confirmMock = vi.spyOn(window, "confirm");
        const mutateAsync = vi.fn().mockRejectedValue({
            payload: {
                message: "No se pudo migrar la empresa.",
            },
        });
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

        useAuthMock.mockReturnValue({
            currentUser: {
                id: "user-1",
                firstName: "Ada",
                lastName: "Lovelace",
                email: "ada@appquilar.test",
                roles: [UserRole.REGULAR_USER],
                address: null,
                location: null,
                companyContext: {
                    companyId: "company-1",
                    companyName: "Acme",
                    companyRole: "ROLE_ADMIN",
                    isCompanyOwner: true,
                    planType: "starter",
                    subscriptionStatus: "canceled",
                    isFoundingAccount: false,
                    productSlotLimit: null,
                    capabilities: null,
                    entitlements: null,
                },
            },
            refreshCurrentUser: vi.fn(),
            hasRole: vi.fn().mockReturnValue(false),
        });
        useCompanyUsersMock.mockReturnValue({
            data: [
                {
                    userId: "owner-user-1",
                    email: "owner@appquilar.test",
                    role: "ROLE_ADMIN",
                    status: "ACCEPTED",
                },
            ],
            isLoading: false,
        });
        useMigrateCompanyToExplorerMock.mockReturnValue({
            isPending: false,
            mutateAsync,
        });

        renderWithProviders(<CompanySubscriptionSettingsCard />);

        confirmMock.mockReturnValueOnce(false);

        await user.click(screen.getByRole("button", { name: "Migrar a Explorador" }));

        expect(mutateAsync).not.toHaveBeenCalled();

        confirmMock.mockReturnValueOnce(true);

        await user.click(screen.getByRole("button", { name: "Migrar a Explorador" }));

        await waitFor(() => {
            expect(toastErrorMock).toHaveBeenCalledWith("No se pudo migrar la empresa.");
        });
        expect(consoleErrorSpy).toHaveBeenCalled();
    });
});
