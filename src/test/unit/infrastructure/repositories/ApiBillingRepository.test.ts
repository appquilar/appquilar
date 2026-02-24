import { describe, expect, it, vi } from "vitest";
import { ApiBillingRepository } from "@/infrastructure/repositories/ApiBillingRepository";
import { createAuthSession } from "@/domain/models/AuthSession";

describe("ApiBillingRepository", () => {
  const createApiClientMock = () => ({
    post: vi.fn(),
  });

  it("creates checkout session with snake_case payload and auth header", async () => {
    const apiClient = createApiClientMock();
    apiClient.post.mockResolvedValue({
      success: true,
      data: { url: "https://stripe.test/checkout" },
    });

    const repository = new ApiBillingRepository(
      apiClient as any,
      () => createAuthSession({ token: "jwt-token" })
    );

    const result = await repository.createCheckoutSession({
      scope: "user",
      planType: "user_pro",
      successUrl: "https://appquilar.com/success",
      cancelUrl: "https://appquilar.com/cancel",
    });

    expect(result).toEqual({ url: "https://stripe.test/checkout" });
    expect(apiClient.post).toHaveBeenCalledWith(
      "/api/billing/checkout-session",
      {
        scope: "user",
        plan_type: "user_pro",
        success_url: "https://appquilar.com/success",
        cancel_url: "https://appquilar.com/cancel",
      },
      {
        headers: {
          Authorization: "Bearer jwt-token",
        },
      }
    );
  });

  it("creates customer portal session and maps response", async () => {
    const apiClient = createApiClientMock();
    apiClient.post.mockResolvedValue({
      success: true,
      data: { url: "https://stripe.test/portal" },
    });

    const repository = new ApiBillingRepository(
      apiClient as any,
      () => createAuthSession({ token: "jwt-token" })
    );

    const result = await repository.createCustomerPortalSession({
      scope: "company",
      returnUrl: "https://appquilar.com/dashboard/companies/1",
    });

    expect(result).toEqual({ url: "https://stripe.test/portal" });
    expect(apiClient.post).toHaveBeenCalledWith(
      "/api/billing/customer-portal-session",
      {
        scope: "company",
        return_url: "https://appquilar.com/dashboard/companies/1",
      },
      {
        headers: {
          Authorization: "Bearer jwt-token",
        },
      }
    );
  });

  it("migrates company to explorer with optional target owner", async () => {
    const apiClient = createApiClientMock();
    apiClient.post.mockResolvedValue({
      success: true,
      data: {
        migrated_owner_user_id: "user-owner-1",
        company_deleted: true,
      },
    });

    const repository = new ApiBillingRepository(
      apiClient as any,
      () => createAuthSession({ token: "jwt-token" })
    );

    const result = await repository.migrateCompanyToExplorer({
      targetOwnerUserId: "user-owner-1",
      confirm: true,
    });

    expect(result).toEqual({
      migratedOwnerUserId: "user-owner-1",
      companyDeleted: true,
    });
    expect(apiClient.post).toHaveBeenCalledWith(
      "/api/billing/company/migrate-to-explorer",
      {
        target_owner_user_id: "user-owner-1",
        confirm: true,
      },
      {
        headers: {
          Authorization: "Bearer jwt-token",
        },
      }
    );
  });

  it("omits Authorization when there is no session", async () => {
    const apiClient = createApiClientMock();
    apiClient.post.mockResolvedValue({
      success: true,
      data: { url: "https://stripe.test/checkout" },
    });

    const repository = new ApiBillingRepository(apiClient as any, () => null);

    await repository.createCheckoutSession({
      scope: "user",
      planType: "user_pro",
      successUrl: "https://appquilar.com/success",
      cancelUrl: "https://appquilar.com/cancel",
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      "/api/billing/checkout-session",
      expect.any(Object),
      { headers: {} }
    );
  });
});
