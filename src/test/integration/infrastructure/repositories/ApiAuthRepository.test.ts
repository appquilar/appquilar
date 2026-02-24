import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";
import { ApiClient } from "@/infrastructure/http/ApiClient";
import { AuthSessionStorage } from "@/infrastructure/auth/AuthSessionStorage";
import { ApiAuthRepository } from "@/infrastructure/repositories/ApiAuthRepository";

const apiBaseUrl = "http://localhost:8000";

const encodeBase64Url = (value: string): string =>
  btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

const makeJwt = (payload: Record<string, unknown>): string => {
  const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = encodeBase64Url(JSON.stringify(payload));
  return `${header}.${body}.signature`;
};

describe("ApiAuthRepository integration", () => {
  it("logs in and persists session token", async () => {
    const token = makeJwt({ sub: "user-1", roles: ["ROLE_USER"] });

    server.use(
      http.post(`${apiBaseUrl}/api/auth/login`, async ({ request }) => {
        const body = await request.json();
        expect(body).toEqual({
          email: "victor@appquilar.com",
          password: "secret",
        });

        return HttpResponse.json({
          success: true,
          data: { token },
        });
      })
    );

    const repository = new ApiAuthRepository(
      new ApiClient({ baseUrl: apiBaseUrl }),
      new AuthSessionStorage()
    );

    const session = await repository.login({
      email: "victor@appquilar.com",
      password: "secret",
    });

    expect(session.token).toBe(token);
    expect(localStorage.getItem("auth_token")).toBe(token);
  });

  it("registers user with snake_case payload and captcha token", async () => {
    server.use(
      http.post(`${apiBaseUrl}/api/auth/register`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;

        expect(body.first_name).toBe("Victor");
        expect(body.last_name).toBe("Saavedra");
        expect(body.email).toBe("victor@appquilar.com");
        expect(body.password).toBe("Password123!");
        expect(body.captcha_token).toBe("captcha-token");
        expect(typeof body.user_id).toBe("string");

        return new HttpResponse(null, { status: 201 });
      })
    );

    const repository = new ApiAuthRepository(
      new ApiClient({ baseUrl: apiBaseUrl }),
      new AuthSessionStorage()
    );

    await repository.register({
      firstName: "Victor",
      lastName: "Saavedra",
      email: "victor@appquilar.com",
      password: "Password123!",
      captchaToken: "captcha-token",
    });
  });

  it("calls authenticated change password endpoint resolving user id from /api/me", async () => {
    const token = makeJwt({ sub: "user-2", roles: ["ROLE_USER"] });
    localStorage.setItem("auth_token", token);

    server.use(
      http.get(`${apiBaseUrl}/api/me`, () =>
        HttpResponse.json({
          success: true,
          data: { id: "user-2" },
        })
      ),
      http.patch(`${apiBaseUrl}/api/users/user-2/change-password`, async ({ request }) => {
        const body = await request.json();
        const authHeader = request.headers.get("authorization");

        expect(authHeader).toBe(`Bearer ${token}`);
        expect(body).toEqual({
          old_password: "old-password",
          new_password: "new-password",
        });

        return new HttpResponse(null, { status: 204 });
      })
    );

    const repository = new ApiAuthRepository(
      new ApiClient({ baseUrl: apiBaseUrl }),
      new AuthSessionStorage()
    );

    await repository.changePassword({
      oldPassword: "old-password",
      newPassword: "new-password",
      token,
    });
  });

  it("logs out and clears local session even when API fails", async () => {
    const token = makeJwt({ sub: "user-3" });
    localStorage.setItem("auth_token", token);

    server.use(
      http.post(`${apiBaseUrl}/api/auth/logout`, () =>
        HttpResponse.json({ message: "boom" }, { status: 500 })
      )
    );

    const repository = new ApiAuthRepository(
      new ApiClient({ baseUrl: apiBaseUrl }),
      new AuthSessionStorage()
    );

    await repository.logout();

    expect(localStorage.getItem("auth_token")).toBeNull();
  });
});
