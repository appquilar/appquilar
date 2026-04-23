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
      cache: "no-store",
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
      subscriptionCancelAtPeriodEnd: false,
      isFoundingAccount: false,
      productSlotLimit: 50,
      capabilities: null,
      entitlements: null,
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

  it("maps early bird capabilities and entitlements from the current session payload", async () => {
    const apiClient = createApiClientMock();
    apiClient.get.mockResolvedValue({
      success: true,
      data: {
        user_id: "user-3",
        first_name: "Ada",
        last_name: "Lovelace",
        email: "ada@appquilar.com",
        roles: ["ROLE_USER"],
        address: null,
        location: null,
        plan_type: "user_pro",
        subscription_status: "active",
        capabilities: {
          basic_analytics: { state: "enabled" },
          team_management: {
            state: "enabled",
            limits: { team_members: 1 },
          },
        },
        entitlements: {
          plan_type: "user_pro",
          subscription_status: "active",
          quotas: {
            active_products: 5,
            team_members: null,
          },
          capabilities: {
            basic_analytics: { state: "enabled" },
          },
          overrides: {
            is_platform_admin: false,
          },
        },
        company_context: {
          company_id: "company-3",
          company_name: "Early Bird Co",
          company_role: "ROLE_ADMIN",
          is_company_owner: true,
          plan_type: "early_bird",
          subscription_status: "active",
          is_founding_account: true,
          product_slot_limit: null,
          capabilities: {
            advanced_analytics: { state: "enabled" },
            api_access: { state: "enabled" },
          },
          entitlements: {
            plan_type: "early_bird",
            subscription_status: "active",
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
            },
            overrides: {
              is_company_owner: true,
              is_company_admin: true,
              is_founding_account: true,
            },
          },
        },
      },
    });

    const repository = new ApiUserRepository(
      apiClient as any,
      () => createAuthSession({ token: "jwt-token" })
    );

    const user = await repository.getCurrentUser();

    expect(user.capabilities).toEqual({
      inventoryManagement: null,
      basicAnalytics: { state: "enabled", limits: null },
      advancedAnalytics: null,
      teamManagement: { state: "enabled", limits: { team_members: 1 } },
      customDomain: null,
      branding: null,
      apiAccess: null,
    });
    expect(user.entitlements).toMatchObject({
      planType: "user_pro",
      subscriptionStatus: "active",
      quotas: {
        activeProducts: 5,
        teamMembers: null,
      },
    });
    expect(user.companyContext).toMatchObject({
      companyId: "company-3",
      companyName: "Early Bird Co",
      companyRole: "ROLE_ADMIN",
      planType: "early_bird",
      subscriptionStatus: "active",
      isCompanyOwner: true,
      isFoundingAccount: true,
      capabilities: {
        advancedAnalytics: { state: "enabled", limits: null },
        apiAccess: { state: "enabled", limits: null },
      },
      entitlements: {
        planType: "early_bird",
        subscriptionStatus: "active",
        overrides: {
          isCompanyOwner: true,
          isCompanyAdmin: true,
          isFoundingAccount: true,
        },
      },
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

  it("maps getById and company user lists with addresses, locations and nested company fallbacks", async () => {
    const apiClient = createApiClientMock();
    apiClient.get
      .mockResolvedValueOnce({
        success: true,
        data: {
          user_id: "user-4",
          first_name: "Nina",
          last_name: "North",
          email: "nina@appquilar.com",
          roles: ["ROLE_USER", 123, "ROLE_ADMIN"],
          address: {
            street: "Calle 1",
            street2: null,
            city: "Madrid",
            postal_code: "28001",
            state: "Madrid",
            country: "ES",
          },
          location: {
            latitude: 40.4,
            longitude: -3.7,
          },
          company: {
            id: "company-4",
            name: "Nested Co",
          },
          status: "pending",
          date_added: "2026-04-10T10:00:00Z",
        },
      })
      .mockResolvedValueOnce({
        success: true,
        data: [
          {
            id: "user-5",
            first_name: "Omar",
            last_name: "Owner",
            email: "omar@appquilar.com",
            roles: ["ROLE_USER"],
            address: null,
            location: null,
            company_id: "company-4",
            company_name: "Nested Co",
            company_role: "ROLE_ADMIN",
            is_company_owner: true,
          },
        ],
      });

    const repository = new ApiUserRepository(apiClient as any, () => null);

    const user = await repository.getById("user/4");
    const companyUsers = await repository.getByCompanyId("company/4");

    expect(apiClient.get).toHaveBeenNthCalledWith(1, "/api/users/user%2F4", {
      headers: {},
    });
    expect(user).toMatchObject({
      id: "user-4",
      roles: ["ROLE_USER", "ROLE_ADMIN"],
      address: {
        postalCode: "28001",
      },
      location: {
        latitude: 40.4,
        longitude: -3.7,
      },
      companyId: "company-4",
      companyName: "Nested Co",
      planType: "explorer",
      subscriptionStatus: "active",
      status: "pending",
      profilePictureId: null,
    });
    expect(user.dateAdded).toEqual(new Date("2026-04-10T10:00:00Z"));
    expect(companyUsers).toEqual([
      expect.objectContaining({
        id: "user-5",
        companyContext: {
          companyId: "company-4",
          companyName: "Nested Co",
          companyRole: "ROLE_ADMIN",
          isCompanyOwner: true,
          planType: "starter",
          subscriptionStatus: "active",
          subscriptionCancelAtPeriodEnd: false,
          isFoundingAccount: false,
          productSlotLimit: null,
          capabilities: null,
          entitlements: null,
        },
      }),
    ]);
  });

  it("updates address payloads and maps paginated platform users", async () => {
    const apiClient = createApiClientMock();
    apiClient.patch.mockResolvedValue(undefined);
    apiClient.get
      .mockResolvedValueOnce({
        success: true,
        data: {
          id: "user-6",
          first_name: "Iris",
          last_name: "Admin",
          email: "iris@appquilar.com",
          roles: ["ROLE_ADMIN"],
          address: {
            street: "Nueva 2",
            street2: "Piso 1",
            city: "Valencia",
            postal_code: "46001",
            state: "Valencia",
            country: "ES",
          },
          location: {
            latitude: 39.4,
            longitude: -0.3,
          },
        },
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: "user-7",
            first_name: "Ada",
            last_name: "Platform",
            email: "ada@appquilar.com",
            roles: ["ROLE_USER"],
            address: null,
            location: null,
            entitlements: {
              plan_type: "user_pro",
              subscription_status: "active",
              quotas: {
                active_products: 5,
                team_members: null,
              },
              capabilities: {
                basic_analytics: { state: "enabled" },
              },
              overrides: {
                is_platform_admin: true,
                is_company_owner: false,
                is_company_admin: false,
                is_founding_account: false,
              },
            },
          },
        ],
        total: 1,
        page: 1,
        per_page: 50,
      });

    const repository = new ApiUserRepository(
      apiClient as any,
      () => createAuthSession({ token: "jwt-token" })
    );

    const updated = await repository.updateAddress("user/6", {
      address: {
        street: "Nueva 2",
        street2: "Piso 1",
        city: "Valencia",
        postalCode: "46001",
        state: "Valencia",
        country: "ES",
      },
      location: {
        latitude: 39.4,
        longitude: -0.3,
      },
    });
    const paginated = await repository.getAllUsers?.();

    expect(apiClient.patch).toHaveBeenCalledWith(
      "/api/users/user%2F6/address",
      {
        address: {
          street: "Nueva 2",
          street2: "Piso 1",
          city: "Valencia",
          postal_code: "46001",
          state: "Valencia",
          country: "ES",
        },
        location: {
          latitude: 39.4,
          longitude: -0.3,
        },
      },
      {
        headers: { Authorization: "Bearer jwt-token" },
      }
    );
    expect(updated).toMatchObject({
      id: "user-6",
      address: {
        city: "Valencia",
      },
      location: {
        latitude: 39.4,
        longitude: -0.3,
      },
    });
    expect(paginated).toMatchObject({
      total: 1,
      page: 1,
      perPage: 50,
    });
    expect(paginated?.users[0]).toMatchObject({
      id: "user-7",
      planType: "user_pro",
      entitlements: {
        planType: "user_pro",
        overrides: {
          isPlatformAdmin: true,
          isCompanyOwner: false,
          isCompanyAdmin: false,
          isFoundingAccount: false,
        },
      },
    });
  });
});
