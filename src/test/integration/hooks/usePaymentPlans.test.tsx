import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "@/test/utils/renderWithProviders";

const {
  mockListPlans,
  mockListSubscribers,
  mockUpdatePlan,
  mockAssignPlan,
  mockInvalidateQueries,
} = vi.hoisted(() => ({
  mockListPlans: vi.fn(),
  mockListSubscribers: vi.fn(),
  mockUpdatePlan: vi.fn(),
  mockAssignPlan: vi.fn(),
  mockInvalidateQueries: vi.fn(),
}));

vi.mock("@/compositionRoot", () => ({
  paymentPlanService: {
    listPlans: mockListPlans,
    listSubscribers: mockListSubscribers,
    updatePlan: mockUpdatePlan,
    assignPlan: mockAssignPlan,
  },
  queryClient: {
    invalidateQueries: mockInvalidateQueries,
  },
}));

import {
  useAssignPaymentPlan,
  usePaymentPlans,
  usePaymentPlanSubscribers,
  useUpdatePaymentPlan,
} from "@/application/hooks/usePaymentPlans";

const basePlan = {
  id: "starter",
  planCode: "starter",
  scope: "company" as const,
  displayName: "Starter",
  subtitle: "10 productos",
  marketingMessage: null,
  badgeText: null,
  featureList: ["Analítica básica"],
  quotas: {
    activeProducts: 10,
    teamMembers: 1,
  },
  capabilities: {
    basicAnalytics: { state: "enabled" as const, limits: null },
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
    stripeProductId: null,
    stripePriceId: null,
    version: 1,
  },
};

const PlansProbe = ({ checkoutOnly = false }: { checkoutOnly?: boolean }) => {
  const query = usePaymentPlans("company", { checkoutOnly });

  return (
    <div data-testid="plans">
      {query.data?.map((plan) => plan.planCode).join(",") ?? "empty"}
    </div>
  );
};

const SubscribersProbe = ({ planCode }: { planCode: string | null }) => {
  const query = usePaymentPlanSubscribers("company", planCode);

  return (
    <div data-testid="subscribers">
      {query.data?.map((subscriber) => subscriber.id).join(",") ?? "empty"}
    </div>
  );
};

const MutationProbe = () => {
  const update = useUpdatePaymentPlan();
  const assign = useAssignPaymentPlan();

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          update.mutate({
            scope: "company",
            planCode: "starter",
            displayName: "Starter",
            subtitle: null,
            marketingMessage: null,
            badgeText: null,
            featureList: ["Analítica básica"],
            quotas: {
              activeProducts: 10,
              teamMembers: 1,
            },
            capabilities: {
              basicAnalytics: { state: "enabled", limits: null },
            },
            sortOrder: 10,
            isActive: true,
            isVisibleInCheckout: true,
            isCheckoutEnabled: true,
            isManualAssignmentEnabled: true,
            priceAmount: 3900,
            priceCurrency: "eur",
            priceInterval: "month",
            stripeProductId: "prod_starter",
          })
        }
      >
        update
      </button>
      <button
        type="button"
        onClick={() =>
          assign.mutate({
            scope: "company",
            planCode: "starter",
            targetId: "company-1",
            subscriptionStatus: "active",
          })
        }
      >
        assign
      </button>
    </div>
  );
};

describe("usePaymentPlans hooks", () => {
  beforeEach(() => {
    mockListPlans.mockReset();
    mockListSubscribers.mockReset();
    mockUpdatePlan.mockReset();
    mockAssignPlan.mockReset();
    mockInvalidateQueries.mockReset();

    mockListPlans.mockResolvedValue([basePlan]);
    mockListSubscribers.mockResolvedValue([
      {
        id: "company-1",
        email: null,
        firstName: null,
        lastName: null,
        name: "Acme Rentals",
        slug: "acme-rentals",
        contactEmail: "ops@acme.test",
        subscriptionStatus: "active",
        planType: "starter",
        isFoundingAccount: false,
      },
    ]);
    mockUpdatePlan.mockResolvedValue(undefined);
    mockAssignPlan.mockResolvedValue(undefined);
    mockInvalidateQueries.mockResolvedValue(undefined);
  });

  it("loads checkout plans with the proper catalog flavour", async () => {
    renderWithProviders(<PlansProbe checkoutOnly />);

    await waitFor(() => {
      expect(mockListPlans).toHaveBeenCalledWith("company", true);
      expect(screen.getByTestId("plans")).toHaveTextContent("starter");
    });
  });

  it("only fetches subscribers when a plan code is provided", async () => {
    const { rerender } = renderWithProviders(<SubscribersProbe planCode={null} />);

    expect(mockListSubscribers).not.toHaveBeenCalled();
    expect(screen.getByTestId("subscribers")).toHaveTextContent("empty");

    rerender(<SubscribersProbe planCode="starter" />);

    await waitFor(() => {
      expect(mockListSubscribers).toHaveBeenCalledWith("company", "starter");
      expect(screen.getByTestId("subscribers")).toHaveTextContent("company-1");
    });
  });

  it("invalidates catalog, subscribers and current user on successful mutations", async () => {
    const user = userEvent.setup();

    renderWithProviders(<MutationProbe />);

    await user.click(screen.getByRole("button", { name: "update" }));
    await user.click(screen.getByRole("button", { name: "assign" }));

    await waitFor(() => {
      expect(mockUpdatePlan).toHaveBeenCalledTimes(1);
      expect(mockAssignPlan).toHaveBeenCalledTimes(1);
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["paymentPlans", "company"],
      });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["paymentPlans"],
      });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["paymentPlans", "company", "starter", "subscribers"],
      });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["currentUser"],
      });
    });
  });
});
