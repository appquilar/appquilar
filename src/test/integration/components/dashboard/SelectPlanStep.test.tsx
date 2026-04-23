import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SelectPlanStep from "@/components/dashboard/upgrade/steps/SelectPlanStep";
import { renderWithProviders } from "@/test/utils/renderWithProviders";
import type { CompanyFormData } from "@/components/dashboard/upgrade/UpgradePage";

const {
  mockUsePaymentPlans,
  mockRefetch,
} = vi.hoisted(() => ({
  mockUsePaymentPlans: vi.fn(),
  mockRefetch: vi.fn(),
}));

vi.mock("@/application/hooks/usePaymentPlans", () => ({
  usePaymentPlans: (...args: unknown[]) => mockUsePaymentPlans(...args),
}));

const buildFormData = (
  overrides: Partial<CompanyFormData> = {}
): CompanyFormData => ({
  name: "Acme Rentals",
  description: "Empresa especializada en alquiler profesional",
  fiscalId: "B12345678",
  slug: "acme-rentals",
  street: "Calle Mayor 1",
  street2: "",
  city: "Madrid",
  state: "Madrid",
  country: "España",
  postalCode: "28001",
  latitude: undefined,
  longitude: undefined,
  contactEmail: "hello@acme.test",
  contactPhoneCountryCode: "ES",
  contactPhonePrefix: "+34",
  contactPhoneNumber: "600000000",
  selectedPlan: "starter",
  ...overrides,
});

describe("SelectPlanStep", () => {
  beforeEach(() => {
    mockUsePaymentPlans.mockReset();
    mockRefetch.mockReset();
    mockRefetch.mockResolvedValue(undefined);
  });

  it("shows the remote error state and retries loading the catalog", async () => {
    const user = userEvent.setup();

    mockUsePaymentPlans.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    });

    renderWithProviders(
      <SelectPlanStep
        formData={buildFormData()}
        onUpdateFormData={vi.fn()}
        onComplete={vi.fn()}
        onBack={vi.fn()}
        isSubmitting={false}
      />
    );

    expect(
      screen.getByText("No se pudo cargar el catálogo de planes ahora mismo.")
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("falls back to the first available remote plan and lets the user select early bird", async () => {
    const user = userEvent.setup();
    const onUpdateFormData = vi.fn();
    const onComplete = vi.fn();

    mockUsePaymentPlans.mockReturnValue({
      data: [
        {
          id: "starter",
          planCode: "starter",
          scope: "company",
          displayName: "Starter",
          subtitle: "10 productos y 1 miembro",
          marketingMessage: null,
          badgeText: null,
          featureList: ["10 productos", "Analítica básica"],
          quotas: {
            activeProducts: 10,
            teamMembers: 1,
          },
          capabilities: {},
          sortOrder: 10,
          isActive: true,
          isVisibleInCheckout: true,
          isCheckoutEnabled: true,
          isManualAssignmentEnabled: true,
          price: {
            amount: 3900,
            currency: "eur",
            interval: "month",
            stripeProductId: null,
            stripePriceId: null,
            version: 1,
          },
        },
        {
          id: "early_bird",
          planCode: "early_bird",
          scope: "company",
          displayName: "Early Bird",
          subtitle: "Para las primeras empresas",
          marketingMessage: "Mismo precio que Starter",
          badgeText: "Primeras empresas",
          featureList: ["Productos ilimitados", "Web Appquilar gestionada"],
          quotas: {
            activeProducts: null,
            teamMembers: null,
          },
          capabilities: {},
          sortOrder: 99,
          isActive: true,
          isVisibleInCheckout: true,
          isCheckoutEnabled: true,
          isManualAssignmentEnabled: true,
          price: {
            amount: 3900,
            currency: "eur",
            interval: "month",
            stripeProductId: null,
            stripePriceId: null,
            version: 1,
          },
        },
      ],
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });

    renderWithProviders(
      <SelectPlanStep
        formData={buildFormData({ selectedPlan: "enterprise" })}
        onUpdateFormData={onUpdateFormData}
        onComplete={onComplete}
        onBack={vi.fn()}
        isSubmitting={false}
      />
    );

    await waitFor(() => {
      expect(onUpdateFormData).toHaveBeenCalledWith({ selectedPlan: "starter" });
    });

    const planHeadings = screen.getAllByRole("heading", { level: 3 });
    expect(planHeadings.map((node) => node.textContent)).toEqual([
      "Starter",
      "Early Bird",
    ]);

    await user.click(screen.getByRole("button", { name: "Elegir Early Bird" }));
    expect(onUpdateFormData).toHaveBeenLastCalledWith({
      selectedPlan: "early_bird",
    });

    await user.click(
      screen.getByRole("button", { name: "Continuar al pago seguro" })
    );
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
