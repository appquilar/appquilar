import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import PaymentPlansManagementPage from "@/components/dashboard/billing/PaymentPlansManagementPage";
import { renderWithProviders } from "@/test/utils/renderWithProviders";

const {
  mockUsePaymentPlans,
  mockUsePaymentPlanSubscribers,
  mockUseUpdatePaymentPlan,
  mockUseAssignPaymentPlan,
  mockToastSuccess,
  mockToastError,
  mockPlansRefetch,
  mockSubscribersRefetch,
  mockUpdateMutateAsync,
  mockAssignMutateAsync,
} = vi.hoisted(() => ({
  mockUsePaymentPlans: vi.fn(),
  mockUsePaymentPlanSubscribers: vi.fn(),
  mockUseUpdatePaymentPlan: vi.fn(),
  mockUseAssignPaymentPlan: vi.fn(),
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
  mockPlansRefetch: vi.fn(),
  mockSubscribersRefetch: vi.fn(),
  mockUpdateMutateAsync: vi.fn(),
  mockAssignMutateAsync: vi.fn(),
}));

vi.mock("@/application/hooks/usePaymentPlans", () => ({
  usePaymentPlans: (...args: unknown[]) => mockUsePaymentPlans(...args),
  usePaymentPlanSubscribers: (...args: unknown[]) =>
    mockUsePaymentPlanSubscribers(...args),
  useUpdatePaymentPlan: () => mockUseUpdatePaymentPlan(),
  useAssignPaymentPlan: () => mockUseAssignPaymentPlan(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}));

const starterPlan = {
  id: "starter",
  planCode: "starter",
  scope: "company" as const,
  displayName: "Starter",
  subtitle: "10 productos y 1 miembro",
  marketingMessage: null,
  badgeText: null,
  featureList: ["10 productos", "Analítica básica"],
  quotas: {
    activeProducts: 10,
    teamMembers: 1,
  },
  capabilities: {
    basicAnalytics: { state: "enabled" as const, limits: null },
    advancedAnalytics: { state: "disabled" as const, limits: null },
    inventoryManagement: { state: "disabled" as const, limits: null },
    teamManagement: {
      state: "enabled" as const,
      limits: { team_members: 1 },
    },
    apiAccess: { state: "disabled" as const, limits: null },
  },
  sortOrder: 10,
  isActive: true,
  isVisibleInCheckout: true,
  isCheckoutEnabled: true,
  isManualAssignmentEnabled: true,
  price: {
    amount: 3900,
    currency: "eur",
    interval: "month",
    stripeProductId: "prod_starter",
    stripePriceId: "price_starter",
    version: 1,
  },
};

const earlyBirdPlan = {
  id: "early_bird",
  planCode: "early_bird",
  scope: "company" as const,
  displayName: "Early Bird",
  subtitle: "Para las primeras empresas",
  marketingMessage: "Mismo precio que Starter",
  badgeText: "Primeras empresas",
  featureList: ["Productos ilimitados", "Web Appquilar gestionada"],
  quotas: {
    activeProducts: null,
    teamMembers: null,
  },
  capabilities: {
    basicAnalytics: { state: "enabled" as const, limits: null },
    advancedAnalytics: { state: "enabled" as const, limits: null },
    inventoryManagement: { state: "enabled" as const, limits: null },
    teamManagement: {
      state: "enabled" as const,
      limits: { team_members: null },
    },
    apiAccess: { state: "enabled" as const, limits: null },
  },
  sortOrder: 99,
  isActive: true,
  isVisibleInCheckout: true,
  isCheckoutEnabled: true,
  isManualAssignmentEnabled: true,
  price: {
    amount: 3900,
    currency: "eur",
    interval: "month",
    stripeProductId: "prod_early",
    stripePriceId: "price_early",
    version: 3,
  },
};

describe("PaymentPlansManagementPage", () => {
  beforeEach(() => {
    mockUsePaymentPlans.mockReset();
    mockUsePaymentPlanSubscribers.mockReset();
    mockUseUpdatePaymentPlan.mockReset();
    mockUseAssignPaymentPlan.mockReset();
    mockToastSuccess.mockReset();
    mockToastError.mockReset();
    mockPlansRefetch.mockReset();
    mockSubscribersRefetch.mockReset();
    mockUpdateMutateAsync.mockReset();
    mockAssignMutateAsync.mockReset();

    mockPlansRefetch.mockResolvedValue(undefined);
    mockSubscribersRefetch.mockResolvedValue(undefined);
    mockUpdateMutateAsync.mockResolvedValue(undefined);
    mockAssignMutateAsync.mockResolvedValue(undefined);

    mockUsePaymentPlans.mockReturnValue({
      data: [starterPlan, earlyBirdPlan],
      isLoading: false,
      isError: false,
      refetch: mockPlansRefetch,
    });

    mockUsePaymentPlanSubscribers.mockImplementation(
      (_scope: string, planCode: string | null, enabled: boolean) => ({
        data: !enabled
          ? []
          : planCode === "early_bird"
            ? [
                {
                  id: "company-2",
                  email: null,
                  firstName: null,
                  lastName: null,
                  name: "Acme Early Bird",
                  slug: "acme-early-bird",
                  contactEmail: "early@acme.test",
                  subscriptionStatus: "active",
                  planType: "early_bird",
                  isFoundingAccount: true,
                },
              ]
            : [
                {
                  id: "company-1",
                  email: null,
                  firstName: null,
                  lastName: null,
                  name: "Acme Starter",
                  slug: "acme-starter",
                  contactEmail: "starter@acme.test",
                  subscriptionStatus: "active",
                  planType: "starter",
                  isFoundingAccount: false,
                },
              ],
        isLoading: false,
        isError: false,
        refetch: mockSubscribersRefetch,
      })
    );

    mockUseUpdatePaymentPlan.mockReturnValue({
      mutateAsync: mockUpdateMutateAsync,
      isPending: false,
    });

    mockUseAssignPaymentPlan.mockReturnValue({
      mutateAsync: mockAssignMutateAsync,
      isPending: false,
    });
  });

  it("hydrates the selected plan and saves edited values using the catalog payload", async () => {
    const user = userEvent.setup();

    renderWithProviders(<PaymentPlansManagementPage />);

    expect(await screen.findByDisplayValue("Starter")).toBeInTheDocument();
    expect(screen.getByDisplayValue("10 productos y 1 miembro")).toBeInTheDocument();
    expect(screen.getByText("Acme Starter")).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Nombre visible"));
    await user.type(screen.getByLabelText("Nombre visible"), "Starter Plus");
    await user.clear(screen.getByLabelText("Productos activos"));
    await user.type(screen.getByLabelText("Productos activos"), "12");
    await user.clear(screen.getByLabelText("Stripe product ID"));
    await user.type(screen.getByLabelText("Stripe product ID"), "prod_starter_custom");
    await user.clear(screen.getByLabelText("Features visibles"));
    await user.type(
      screen.getByLabelText("Features visibles"),
      "12 productos{enter}Analítica básica"
    );

    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => {
      expect(mockUpdateMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          scope: "company",
          planCode: "starter",
          displayName: "Starter Plus",
          quotas: {
            activeProducts: 12,
            teamMembers: 1,
          },
          featureList: ["12 productos", "Analítica básica"],
          stripeProductId: "prod_starter_custom",
        })
      );
      expect(mockPlansRefetch).toHaveBeenCalledTimes(1);
      expect(mockToastSuccess).toHaveBeenCalledWith("Plan actualizado.");
    });
  });

  it("switches plans, refreshes subscribers and assigns the selected plan manually", async () => {
    const user = userEvent.setup();

    renderWithProviders(<PaymentPlansManagementPage />);

    await user.click(screen.getByRole("button", { name: /Early Bird/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Early Bird" })).toBeInTheDocument();
      expect(screen.getByText("Acme Early Bird")).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText("UUID objetivo"), "company-2");
    await user.selectOptions(screen.getByLabelText("Estado"), "paused");
    await user.click(screen.getByRole("button", { name: "Asignar" }));

    await waitFor(() => {
      expect(mockAssignMutateAsync).toHaveBeenCalledWith({
        scope: "company",
        planCode: "early_bird",
        targetId: "company-2",
        subscriptionStatus: "paused",
      });
      expect(mockToastSuccess).toHaveBeenCalledWith("Plan asignado manualmente.");
      expect(screen.getByLabelText("UUID objetivo")).toHaveValue("");
    });
  });

  it("shows the loading, error and empty states for the plan catalog", () => {
    mockUsePaymentPlans.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: mockPlansRefetch,
    });

    const { rerender } = renderWithProviders(<PaymentPlansManagementPage />);

    expect(document.querySelector(".animate-spin")).not.toBeNull();

    mockUsePaymentPlans.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockPlansRefetch,
    });

    rerender(<PaymentPlansManagementPage />);

    expect(screen.getByText("No se pudo cargar el catálogo de empresa.")).toBeInTheDocument();

    mockUsePaymentPlans.mockReturnValueOnce({
      data: [],
      isLoading: false,
      isError: false,
      refetch: mockPlansRefetch,
    });

    rerender(<PaymentPlansManagementPage />);

    expect(screen.getByText("No hay planes configurados.")).toBeInTheDocument();
  });

  it("validates numeric catalog fields before saving", async () => {
    const user = userEvent.setup();

    renderWithProviders(<PaymentPlansManagementPage />);
    expect(await screen.findByDisplayValue("Starter")).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Orden"));
    await user.type(screen.getByLabelText("Orden"), "abc");
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
    expect(await screen.findByText("El orden debe ser un numero valido.")).toBeInTheDocument();
    expect(mockUpdateMutateAsync).not.toHaveBeenCalled();

    await user.clear(screen.getByLabelText("Orden"));
    await user.type(screen.getByLabelText("Orden"), "12");
    await user.clear(screen.getByLabelText("Precio mensual (EUR)"));
    await user.type(screen.getByLabelText("Precio mensual (EUR)"), "-5");
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
    expect(await screen.findByText("Introduce un precio mensual valido.")).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Precio mensual (EUR)"));
    await user.type(screen.getByLabelText("Precio mensual (EUR)"), "39");
    await user.clear(screen.getByLabelText("Productos activos"));
    await user.type(screen.getByLabelText("Productos activos"), "doce");
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
    expect(await screen.findByText("La cuota de productos debe ser numerica.")).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Productos activos"));
    await user.type(screen.getByLabelText("Productos activos"), "12");
    await user.clear(screen.getByLabelText("Miembros de equipo"));
    await user.type(screen.getByLabelText("Miembros de equipo"), "uno");
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
    expect(await screen.findByText("La cuota de miembros debe ser numerica.")).toBeInTheDocument();
    expect(mockUpdateMutateAsync).not.toHaveBeenCalled();
  }, 15000);

  it("refreshes catalog queries and surfaces backend errors when save or assign fail", async () => {
    const user = userEvent.setup();
    mockUpdateMutateAsync.mockRejectedValueOnce({
      payload: {
        errors: {
          display_name: ["El nombre visible ya existe."],
        },
      },
    });
    mockAssignMutateAsync.mockRejectedValueOnce({
      payload: {
        message: "No se pudo asignar el plan a la empresa.",
      },
    });

    renderWithProviders(<PaymentPlansManagementPage />);

    await user.click(screen.getByRole("button", { name: "Recargar" }));

    await waitFor(() => {
      expect(mockPlansRefetch).toHaveBeenCalled();
      expect(mockSubscribersRefetch).toHaveBeenCalled();
    });

    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("El nombre visible ya existe.");
    });

    await user.type(screen.getByLabelText("UUID objetivo"), "company-1");
    await user.click(screen.getByRole("button", { name: "Asignar" }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("No se pudo asignar el plan a la empresa.");
    });
  });
});
