import { describe, expect, it } from "vitest";
import { AuthSessionStorage } from "@/infrastructure/auth/AuthSessionStorage";
import { UserRole } from "@/domain/models/UserRole";

const encodeBase64Url = (value: string): string =>
  btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

const makeJwt = (payload: Record<string, unknown>): string => {
  const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = encodeBase64Url(JSON.stringify(payload));
  return `${header}.${body}.signature`;
};

describe("AuthSessionStorage", () => {
  it("saves token and rebuilds session with decoded claims", () => {
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    const token = makeJwt({
      sub: "user-1",
      roles: [UserRole.ADMIN, UserRole.REGULAR_USER, "UNKNOWN_ROLE"],
      exp: expiresAt,
    });

    const storage = new AuthSessionStorage();
    const session = storage.saveToken(token);

    expect(session.token).toBe(token);
    expect(session.userId).toBe("user-1");
    expect(session.roles).toEqual([UserRole.ADMIN, UserRole.REGULAR_USER]);
    expect(session.expiresAt?.getTime()).toBe(expiresAt * 1000);
    expect(localStorage.getItem("auth_token")).toBe(token);
  });

  it("returns null when there is no stored token", () => {
    const storage = new AuthSessionStorage();

    expect(storage.getCurrentSession()).toBeNull();
    expect(storage.getCurrentSessionSync()).toBeNull();
  });

  it("clears session token", () => {
    const storage = new AuthSessionStorage();
    storage.saveToken(makeJwt({ sub: "user-1" }));

    storage.clear();

    expect(storage.getCurrentSession()).toBeNull();
    expect(localStorage.getItem("auth_token")).toBeNull();
  });

  it("builds a minimal session when token payload is invalid", () => {
    const storage = new AuthSessionStorage();
    const token = "invalid.token";

    storage.saveToken(token);
    const session = storage.getCurrentSession();

    expect(session).toEqual({
      token,
      userId: null,
      roles: [],
      expiresAt: null,
    });
  });

  it("returns session synchronously from local storage", () => {
    const token = makeJwt({ sub: "sync-user", roles: [UserRole.REGULAR_USER] });
    localStorage.setItem("auth_token", token);

    const storage = new AuthSessionStorage();
    const session = storage.getCurrentSessionSync();

    expect(session?.userId).toBe("sync-user");
    expect(session?.roles).toEqual([UserRole.REGULAR_USER]);
  });
});
