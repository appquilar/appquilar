import { describe, expect, it } from "vitest";
import {
  createAuthSession,
  isAuthenticated,
  isSessionExpired,
  sessionHasRole,
  toAuthorizationHeader,
} from "@/domain/models/AuthSession";
import { UserRole } from "@/domain/models/UserRole";

describe("AuthSession model helpers", () => {
  it("creates a session with defaults", () => {
    const session = createAuthSession({ token: "jwt-token" });

    expect(session).toEqual({
      token: "jwt-token",
      userId: null,
      roles: [],
      expiresAt: null,
    });
  });

  it("creates a session with explicit values", () => {
    const expiresAt = new Date("2026-02-24T10:00:00.000Z");
    const session = createAuthSession({
      token: "jwt-token",
      userId: "user-1",
      roles: [UserRole.REGULAR_USER],
      expiresAt,
    });

    expect(session.userId).toBe("user-1");
    expect(session.roles).toEqual([UserRole.REGULAR_USER]);
    expect(session.expiresAt).toBe(expiresAt);
  });

  it("computes expiration and authentication state", () => {
    const now = new Date("2026-02-24T12:00:00.000Z");
    const expiredSession = createAuthSession({
      token: "expired",
      expiresAt: new Date("2026-02-24T11:59:59.000Z"),
    });
    const activeSession = createAuthSession({
      token: "active",
      expiresAt: new Date("2026-02-24T12:00:01.000Z"),
    });
    const withoutExpiry = createAuthSession({ token: "no-exp" });

    expect(isSessionExpired(expiredSession, now)).toBe(true);
    expect(isSessionExpired(activeSession, now)).toBe(false);
    expect(isSessionExpired(withoutExpiry, now)).toBe(false);
    expect(isSessionExpired(null, now)).toBe(false);

    expect(isAuthenticated(expiredSession, now)).toBe(false);
    expect(isAuthenticated(activeSession, now)).toBe(true);
    expect(isAuthenticated(withoutExpiry, now)).toBe(true);
    expect(isAuthenticated(null, now)).toBe(false);
  });

  it("builds authorization header and checks roles safely", () => {
    const session = createAuthSession({
      token: "jwt-token",
      roles: [UserRole.ADMIN],
    });

    expect(toAuthorizationHeader(session)).toBe("Bearer jwt-token");
    expect(toAuthorizationHeader(null)).toBeNull();
    expect(toAuthorizationHeader(createAuthSession({ token: "" }))).toBeNull();

    expect(sessionHasRole(session, UserRole.ADMIN)).toBe(true);
    expect(sessionHasRole(session, UserRole.REGULAR_USER)).toBe(false);
    expect(sessionHasRole(null, UserRole.ADMIN)).toBe(false);
  });
});

