import { describe, expect, it } from "vitest";
import { canRoleAccess, hasRole, UserRole } from "@/domain/models/UserRole";

describe("UserRole helpers", () => {
  it("allows admin role access to any required roles", () => {
    expect(
      canRoleAccess(UserRole.ADMIN, [UserRole.REGULAR_USER, UserRole.COMPANY_ADMIN])
    ).toBe(true);
  });

  it("allows regular user only when regular role is required", () => {
    expect(canRoleAccess(UserRole.REGULAR_USER, [UserRole.REGULAR_USER])).toBe(true);
    expect(canRoleAccess(UserRole.REGULAR_USER, [UserRole.ADMIN])).toBe(false);
  });

  it("denies unsupported roles by default", () => {
    expect(
      canRoleAccess(UserRole.COMPANY_ADMIN, [UserRole.REGULAR_USER, UserRole.ADMIN])
    ).toBe(false);
  });

  it("checks role existence in role arrays", () => {
    expect(hasRole([UserRole.ADMIN, UserRole.REGULAR_USER], UserRole.ADMIN)).toBe(true);
    expect(hasRole([UserRole.REGULAR_USER], UserRole.COMPANY_ADMIN)).toBe(false);
  });
});

