import { describe, expect, it } from "vitest";

import {
  createUser,
  getUserCompanyName,
  getUserCompanyRole,
  getUserFullName,
  hasCompanyMembership,
  isCompanyOwnerUser,
  getUserCompanyId,
  userHasAddress,
  userHasAnyRole,
  userHasLocation,
  userHasRole,
  isCompanyAdminUser,
  isPlatformAdminUser,
  isRegularUser,
} from "@/domain/models/User";
import { UserRole } from "@/domain/models/UserRole";

describe("User access helpers", () => {
  it("uses platform admin entitlement overrides before raw roles", () => {
    const user = createUser({
      id: "user-1",
      firstName: "Carla",
      lastName: "Company",
      email: "carla@appquilar.com",
      roles: [UserRole.ADMIN],
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
          isCompanyOwner: true,
          isCompanyAdmin: true,
          isFoundingAccount: false,
        },
      },
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
    });

    expect(isPlatformAdminUser(user)).toBe(false);
    expect(isRegularUser(user)).toBe(true);
    expect(isCompanyAdminUser(user)).toBe(true);
    expect(getUserCompanyId(user)).toBe("company-1");
  });

  it("falls back to names, company data and raw ownership flags when context is missing", () => {
    const user = createUser({
      id: "user-2",
      firstName: "",
      lastName: "",
      email: "plain@appquilar.com",
      roles: [UserRole.REGULAR_USER],
      address: {
        street: "Calle 1",
        street2: null,
        city: "Madrid",
        postalCode: "28001",
        state: "Madrid",
        country: "ES",
      },
      location: {
        latitude: 40.4,
        longitude: -3.7,
      },
      companyId: "company-legacy",
      companyName: "Legacy Co",
      companyRole: "ROLE_CONTRIBUTOR",
      isCompanyOwner: true,
    });

    expect(getUserFullName(user)).toBe("plain@appquilar.com");
    expect(userHasAnyRole(user)).toBe(true);
    expect(userHasRole(user, UserRole.REGULAR_USER)).toBe(true);
    expect(userHasAddress(user)).toBe(true);
    expect(userHasLocation(user)).toBe(true);
    expect(getUserCompanyId(user)).toBe("company-legacy");
    expect(getUserCompanyName(user)).toBe("Legacy Co");
    expect(getUserCompanyRole(user)).toBe("ROLE_CONTRIBUTOR");
    expect(hasCompanyMembership(user)).toBe(true);
    expect(isCompanyOwnerUser(user)).toBe(true);
    expect(isCompanyAdminUser(user)).toBe(false);
    expect(isRegularUser(user)).toBe(true);
  });

  it("handles nullish users and entitlement overrides consistently", () => {
    const companyContextUser = createUser({
      id: "user-3",
      firstName: "Ana",
      lastName: "Admin",
      email: "ana@appquilar.com",
      roles: [],
      entitlements: {
        planType: "user_pro",
        subscriptionStatus: "active",
        quotas: {
          activeProducts: 10,
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
      companyContext: {
        companyId: "company-2",
        companyName: "Acme 2",
        companyRole: "ROLE_CONTRIBUTOR",
        isCompanyOwner: false,
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
            teamMembers: 5,
          },
          capabilities: {},
          overrides: {
            isPlatformAdmin: true,
            isCompanyOwner: false,
            isCompanyAdmin: true,
            isFoundingAccount: false,
          },
        },
      },
    });

    expect(getUserFullName(companyContextUser)).toBe("Ana Admin");
    expect(isPlatformAdminUser(companyContextUser)).toBe(true);
    expect(isRegularUser(companyContextUser)).toBe(false);
    expect(isCompanyAdminUser(companyContextUser)).toBe(true);
    expect(isCompanyOwnerUser(companyContextUser)).toBe(false);
    expect(getUserCompanyId(null)).toBeNull();
    expect(getUserCompanyName(undefined)).toBeNull();
    expect(getUserCompanyRole(undefined)).toBeNull();
    expect(hasCompanyMembership(undefined)).toBe(false);
    expect(isPlatformAdminUser(null)).toBe(false);
    expect(isRegularUser(undefined)).toBe(false);
    expect(isCompanyOwnerUser(null)).toBe(false);
    expect(isCompanyAdminUser(undefined)).toBe(false);

    const rawAdminUser = createUser({
      id: "user-4",
      firstName: "Root",
      lastName: "Admin",
      email: "root@appquilar.com",
      roles: [UserRole.ADMIN],
    });

    expect(isPlatformAdminUser(rawAdminUser)).toBe(true);
  });
});
