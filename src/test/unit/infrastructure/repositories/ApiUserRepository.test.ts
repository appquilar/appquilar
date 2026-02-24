import { describe, expect, it, vi } from "vitest";
import { ApiUserRepository } from "@/infrastructure/repositories/ApiUserRepository";
import { createAuthSession } from "@/domain/models/AuthSession";

describe("ApiUserRepository", () => {
  const createApiClientMock = () => ({
    get: vi.fn(),
    patch: vi.fn(),
  });

  it("maps current user including company context and slot limits", async () => {
    const apiClient = createApiClientMock();
    apiClient.get.mockResolvedValue({
      success: true,
      data: {
        id: "user-1",
        first_name: "Victor",
        last_name: "Saavedra",
        email: "victor@appquilar.com",
        roles: ["ROLE_USER"],
        address: null,
        location: null,
        plan_type: "user_pro",
        subscription_status: "active",
        product_slot_limit: 5,
        company_context: {
          company_id: "company-1",
          company_name: "Appquilar Tools",
          company_role: "ROLE_ADMIN",
          is_company_owner: true,
          plan_type: "pro",
          subscription_status: "active",
          is_founding_account: false,
          product_slot_limit: 50,
        },
      },
    });

    const repository = new ApiUserRepository(
      apiClient as any,
      () => createAuthSession({ token: "jwt-token" })
    );

    const user = await repository.getCurrentUser();

    expect(apiClient.get).toHaveBeenCalledWith("/api/me", {
      headers: { Authorization: "Bearer jwt-token" },
    });
    expect(user.planType).toBe("user_pro");
    expect(user.subscriptionStatus).toBe("active");
    expect(user.productSlotLimit).toBe(5);
    expect(user.companyContext).toEqual({
      companyId: "company-1",
      companyName: "Appquilar Tools",
      companyRole: "ROLE_ADMIN",
      isCompanyOwner: true,
      planType: "pro",
      subscriptionStatus: "active",
      isFoundingAccount: false,
      productSlotLimit: 50,
    });
  });

  it("falls back to legacy company fields and default plans", async () => {
    const apiClient = createApiClientMock();
    apiClient.get.mockResolvedValue({
      success: true,
      data: {
        id: "user-2",
        first_name: "User",
        last_name: "Demo",
        email: "user@appquilar.com",
        roles: ["ROLE_USER"],
        address: null,
        location: null,
        company_id: "company-2",
        company_name: "Company Legacy",
        company_role: "ROLE_CONTRIBUTOR",
        is_company_owner: false,
      },
    });

    const repository = new ApiUserRepository(
      apiClient as any,
      () => createAuthSession({ token: "jwt-token" })
    );

    const user = await repository.getCurrentUser();

    expect(user.planType).toBe("explorer");
    expect(user.subscriptionStatus).toBe("active");
    expect(user.companyContext).toMatchObject({
      companyId: "company-2",
      companyName: "Company Legacy",
      companyRole: "ROLE_CONTRIBUTOR",
      planType: "starter",
      subscriptionStatus: "active",
      isCompanyOwner: false,
    });
  });

  it("updates user using snake_case fields and reloads user", async () => {
    const apiClient = createApiClientMock();
    apiClient.patch.mockResolvedValue(undefined);
    apiClient.get.mockResolvedValue({
      success: true,
      data: {
        id: "user-1",
        first_name: "Victor",
        last_name: "S",
        email: "victor@appquilar.com",
        roles: ["ROLE_USER"],
        address: null,
        location: null,
        profile_picture_id: "media-22",
      },
    });

    const repository = new ApiUserRepository(
      apiClient as any,
      () => createAuthSession({ token: "jwt-token" })
    );

    await repository.update("user-1", {
      firstName: "Victor",
      profilePictureId: "media-22",
    });

    expect(apiClient.patch).toHaveBeenCalledWith(
      "/api/users/user-1",
      {
        first_name: "Victor",
        profile_picture_id: "media-22",
      },
      {
        headers: { Authorization: "Bearer jwt-token" },
      }
    );
  });

  it("builds query string for global users list filters", async () => {
    const apiClient = createApiClientMock();
    apiClient.get.mockResolvedValue({
      data: [],
      total: 0,
      page: 2,
      per_page: 20,
    });

    const repository = new ApiUserRepository(
      apiClient as any,
      () => createAuthSession({ token: "jwt-token" })
    );

    await repository.getAllUsers?.({
      id: "id-1",
      email: "victor@appquilar.com",
      name: "Victor",
      page: 2,
      perPage: 20,
    });

    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/users?id=id-1&email=victor%40appquilar.com&name=Victor&page=2&per_page=20",
      {
        headers: { Authorization: "Bearer jwt-token" },
      }
    );
  });
});
