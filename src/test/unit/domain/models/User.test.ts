import { describe, expect, it } from "vitest";

import {
  createUser,
  getUserCompanyId,
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
});
