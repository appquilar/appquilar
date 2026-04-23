import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthSessionStorage } from "@/infrastructure/auth/AuthSessionStorage";
import { UserRole } from "@/domain/models/UserRole";

const encodeBase64Url = (value: string): string =>
  btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

const makeJwt = (payload: Record<string, unknown>): string => {
  const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = encodeBase64Url(JSON.stringify(payload));
  return `${header}.${body}.signature`;
};

const makeRawJwtBody = (rawPayload: string): string => {
  const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = encodeBase64Url(rawPayload);
  return `${header}.${body}.signature`;
};

describe("AuthSessionStorage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  it("treats expired persisted tokens as logged out and removes them from storage", () => {
    const expiredToken = makeJwt({
      sub: "expired-user",
      exp: Math.floor(Date.now() / 1000) - 60,
    });
    localStorage.setItem("auth_token", expiredToken);

    const storage = new AuthSessionStorage();

    expect(storage.getCurrentSessionSync()).toBeNull();
    expect(localStorage.getItem("auth_token")).toBeNull();

    localStorage.setItem("auth_token", expiredToken);

    expect(storage.getCurrentSession()).toBeNull();
    expect(localStorage.getItem("auth_token")).toBeNull();
  });

  it("tolerates inaccessible browser storage and still returns an in-memory session", () => {
    const localStorageGetter = vi
      .spyOn(window, "localStorage", "get")
      .mockImplementation(() => {
        throw new Error("blocked");
      });

    const token = makeJwt({
      sub: "",
      roles: "ROLE_ADMIN",
      exp: "invalid",
    });

    const storage = new AuthSessionStorage();
    const session = storage.saveToken(token);

    expect(session).toEqual({
      token,
      userId: null,
      roles: [],
      expiresAt: null,
    });
    expect(storage.getCurrentSession()).toBeNull();

    localStorageGetter.mockRestore();
  });

  it("returns a minimal sync session for malformed JWT payloads", () => {
    localStorage.setItem("auth_token", "header.payload.signature");

    const storage = new AuthSessionStorage();

    expect(storage.getCurrentSessionSync()).toEqual({
      token: "header.payload.signature",
      userId: null,
      roles: [],
      expiresAt: null,
    });
  });

  it("ignores JWT payloads that decode to non-object values and safely clears without storage access", () => {
    const token = makeRawJwtBody("1");
    localStorage.setItem("auth_token", token);

    const storage = new AuthSessionStorage();

    expect(storage.getCurrentSessionSync()).toEqual({
      token,
      userId: null,
      roles: [],
      expiresAt: null,
    });

    vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
      throw new Error("blocked");
    });

    expect(() => storage.clear()).not.toThrow();
  });

  it("returns null gracefully when browser storage is unavailable because window does not exist", () => {
    const originalWindow = globalThis.window;

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: undefined,
    });

    const storage = new AuthSessionStorage();

    expect(storage.getCurrentSession()).toBeNull();

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
    });
  });
});
