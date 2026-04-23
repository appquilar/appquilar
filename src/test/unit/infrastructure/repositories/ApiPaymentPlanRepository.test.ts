import { describe, expect, it, vi } from "vitest";

import { createAuthSession } from "@/domain/models/AuthSession";
import { ApiPaymentPlanRepository } from "@/infrastructure/repositories/ApiPaymentPlanRepository";

describe("ApiPaymentPlanRepository", () => {
  const createApiClientMock = () => ({
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  });

  it("maps admin plans including early bird capabilities and pricing", async () => {
    const apiClient = createApiClientMock();
    apiClient.get.mockResolvedValue({
      success: true,
      data: [
        {
          plan_code: "early_bird",
          scope: "company",
          display_name: "Early Bird",
          subtitle: "Para las primeras empresas",
          marketing_message: "Mismo plan que enterprise",
          badge_text: "Primeras empresas",
          feature_list: ["Productos ilimitados", "Analítica avanzada"],
          quotas: {
            active_products: null,
            team_members: null,
          },
          capabilities: {
            basic_analytics: { state: "enabled" },
            advanced_analytics: { state: "enabled" },
            team_management: {
              state: "enabled",
              limits: { team_members: null },
            },
            api_access: { state: "enabled" },
          },
          sort_order: 40,
          is_active: true,
          is_visible_in_checkout: true,
          is_checkout_enabled: true,
          is_manual_assignment_enabled: true,
          price: {
            amount: 3900,
            currency: "eur",
            interval: "month",
            stripe_product_id: "prod_early",
            stripe_price_id: "price_early",
            version: 3,
          },
        },
      ],
      total: 1,
    });

    const repository = new ApiPaymentPlanRepository(
      apiClient as never,
      () => createAuthSession({ token: "jwt-token" })
    );

    const plans = await repository.listPlans("company");

    expect(apiClient.get).toHaveBeenCalledWith("/api/admin/payment-plans?scope=company", {
      headers: { Authorization: "Bearer jwt-token" },
    });
    expect(plans).toEqual([
      {
        id: "early_bird",
        planCode: "early_bird",
        scope: "company",
        displayName: "Early Bird",
        subtitle: "Para las primeras empresas",
        marketingMessage: "Mismo plan que enterprise",
        badgeText: "Primeras empresas",
        featureList: ["Productos ilimitados", "Analítica avanzada"],
        quotas: {
          activeProducts: null,
          teamMembers: null,
        },
        capabilities: {
          inventoryManagement: null,
          basicAnalytics: { state: "enabled", limits: null },
          advancedAnalytics: { state: "enabled", limits: null },
          teamManagement: {
            state: "enabled",
            limits: { team_members: null },
          },
          customDomain: null,
          branding: null,
          apiAccess: { state: "enabled", limits: null },
        },
        sortOrder: 40,
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
      },
    ]);
  });

  it("uses the checkout endpoint when listing public plans", async () => {
    const apiClient = createApiClientMock();
    apiClient.get.mockResolvedValue({
      success: true,
      data: [],
      total: 0,
    });

    const repository = new ApiPaymentPlanRepository(apiClient as never, () => null);

    await repository.listPlans("company", true);

    expect(apiClient.get).toHaveBeenCalledWith("/api/billing/plans?scope=company", {
      headers: {},
    });
  });

  it("serializes updates, subscribers and manual assignments with snake_case payloads", async () => {
    const apiClient = createApiClientMock();
    apiClient.patch.mockResolvedValue(undefined);
    apiClient.get.mockResolvedValue({
      success: true,
      data: [
        {
          id: "company-1",
          name: "Acme Rentals",
          contact_email: "ops@acme.test",
          subscription_status: "active",
          plan_type: "early_bird",
          is_founding_account: true,
        },
      ],
      total: 1,
    });
    apiClient.post.mockResolvedValue(undefined);

    const repository = new ApiPaymentPlanRepository(
      apiClient as never,
      () => createAuthSession({ token: "jwt-token" })
    );

    await repository.updatePlan({
      scope: "company",
      planCode: "early_bird",
      displayName: "Early Bird",
      subtitle: "Para las primeras empresas",
      marketingMessage: "Mismo precio que starter",
      badgeText: "Primeras empresas",
      featureList: ["Productos ilimitados", "Web Appquilar gestionada"],
      quotas: {
        activeProducts: null,
        teamMembers: null,
      },
      capabilities: {
        inventoryManagement: {
          state: "enabled",
          limits: {
            maxProductsWithInventory: null,
            maxQuantityPerProduct: null,
          },
        },
        basicAnalytics: { state: "enabled", limits: null },
        advancedAnalytics: { state: "enabled", limits: null },
        teamManagement: {
          state: "enabled",
          limits: { team_members: null },
        },
        apiAccess: { state: "enabled", limits: null },
      },
      sortOrder: 99,
      isActive: true,
      isVisibleInCheckout: true,
      isCheckoutEnabled: true,
      isManualAssignmentEnabled: true,
      priceAmount: 3900,
      priceCurrency: "eur",
      priceInterval: "month",
      stripeProductId: "prod_early",
    });

    expect(apiClient.patch).toHaveBeenCalledWith(
      "/api/admin/payment-plans/early_bird",
      {
        plan_code: "early_bird",
        display_name: "Early Bird",
        subtitle: "Para las primeras empresas",
        marketing_message: "Mismo precio que starter",
        badge_text: "Primeras empresas",
        feature_list: ["Productos ilimitados", "Web Appquilar gestionada"],
        quotas: {
          active_products: null,
          team_members: null,
        },
        capabilities: {
          inventory_management: {
            state: "enabled",
            limits: {
              max_products_with_inventory: null,
              max_quantity_per_product: null,
            },
          },
          basic_analytics: {
            state: "enabled",
            limits: null,
          },
          advanced_analytics: {
            state: "enabled",
            limits: null,
          },
          team_management: {
            state: "enabled",
            limits: { team_members: null },
          },
          api_access: {
            state: "enabled",
            limits: null,
          },
        },
        sort_order: 99,
        is_active: true,
        is_visible_in_checkout: true,
        is_checkout_enabled: true,
        is_manual_assignment_enabled: true,
        price_amount: 3900,
        price_currency: "eur",
        price_interval: "month",
        stripe_product_id: "prod_early",
      },
      {
        headers: { Authorization: "Bearer jwt-token" },
        skipParseJson: true,
      }
    );

    const subscribers = await repository.listSubscribers("company", "early_bird");

    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/admin/payment-plans/company/early_bird/subscribers",
      {
        headers: { Authorization: "Bearer jwt-token" },
      }
    );
    expect(subscribers).toEqual([
      {
        id: "company-1",
        email: null,
        firstName: null,
        lastName: null,
        name: "Acme Rentals",
        slug: null,
        contactEmail: "ops@acme.test",
        subscriptionStatus: "active",
        planType: "early_bird",
        isFoundingAccount: true,
      },
    ]);

    await repository.assignPlan({
      scope: "company",
      planCode: "early_bird",
      targetId: "company-1",
      subscriptionStatus: "paused",
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      "/api/admin/payment-plans/assign",
      {
        scope: "company",
        plan_code: "early_bird",
        target_id: "company-1",
        subscription_status: "paused",
      },
      {
        headers: { Authorization: "Bearer jwt-token" },
        skipParseJson: true,
      }
    );
  });
});
