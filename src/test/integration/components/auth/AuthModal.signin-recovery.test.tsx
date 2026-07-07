import { beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import AuthModal from "@/components/auth/AuthModal";
import { queryClient } from "@/composition/queryClient";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { server } from "@/test/mocks/server";

const apiBaseUrl = "http://localhost:8000";

const encodeBase64Url = (value: string): string =>
  btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

const makeJwt = (payload: Record<string, unknown>): string => {
  const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = encodeBase64Url(JSON.stringify(payload));
  return `${header}.${body}.signature`;
};

const AuthProbe = () => {
  const { currentUser } = useAuth();

  return <div data-testid="auth-user">{currentUser ? `Hola ${currentUser.firstName} ${currentUser.lastName}` : "anon"}</div>;
};

const SlowProductQuery = () => {
  useQuery({
    queryKey: ["product", "slow"],
    queryFn: () => new Promise(() => undefined),
  });

  return null;
};

const renderSigninModal = (
  onClose = vi.fn(),
  options: { withSlowProductQuery?: boolean } = {}
) => {
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthProvider>
          {options.withSlowProductQuery && <SlowProductQuery />}
          <AuthModal isOpen onClose={onClose} />
          <AuthProbe />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );

  return { onClose };
};

describe("AuthModal sign in recovery", () => {
  beforeEach(() => {
    queryClient.clear();
    localStorage.clear();
    sessionStorage.clear();
  });

  it("does not show a login error when the token was saved and a retry loads the user", async () => {
    const token = makeJwt({
      sub: "renter-manual",
      roles: ["ROLE_USER"],
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    let meRequests = 0;

    server.use(
      http.post(`${apiBaseUrl}/api/auth/login`, async ({ request }) => {
        await expect(request.json()).resolves.toEqual({
          email: "renter.manual@appquilar.test",
          password: "Password123!",
        });

        return HttpResponse.json({
          success: true,
          data: { token },
        });
      }),
      http.get(`${apiBaseUrl}/api/me`, ({ request }) => {
        meRequests += 1;
        expect(request.headers.get("authorization")).toBe(`Bearer ${token}`);

        if (meRequests === 1) {
          return HttpResponse.json(
            { success: false, message: "Temporary session projection lag" },
            { status: 500 }
          );
        }

        return HttpResponse.json({
          success: true,
          data: {
            id: "renter-manual",
            first_name: "Renta",
            last_name: "Manual",
            email: "renter.manual@appquilar.test",
            roles: ["ROLE_USER"],
            address: null,
            location: null,
            plan_type: "explorer",
            subscription_status: "active",
          },
        });
      })
    );

    const user = userEvent.setup();
    const { onClose } = renderSigninModal();

    await user.type(screen.getByLabelText("Correo electrónico"), "renter.manual@appquilar.test");
    await user.type(screen.getByLabelText("Contraseña"), "Password123!");
    const signInButtons = screen.getAllByRole("button", { name: "Iniciar sesión" });
    await user.click(signInButtons[signInButtons.length - 1]);

    await waitFor(() => {
      expect(meRequests).toBe(2);
      expect(screen.getByTestId("auth-user")).toHaveTextContent("Hola Renta Manual");
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    expect(screen.queryByText("No se pudo iniciar sesión. Inténtalo de nuevo.")).not.toBeInTheDocument();
  });

  it("closes after login even if product refresh is still pending", async () => {
    const token = makeJwt({
      sub: "renter-manual",
      roles: ["ROLE_USER"],
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    server.use(
      http.post(`${apiBaseUrl}/api/auth/login`, () =>
        HttpResponse.json({
          success: true,
          data: { token },
        })
      ),
      http.get(`${apiBaseUrl}/api/me`, () =>
        HttpResponse.json({
          success: true,
          data: {
            id: "renter-manual",
            first_name: "Renta",
            last_name: "Manual",
            email: "renter.manual@appquilar.test",
            roles: ["ROLE_USER"],
            address: null,
            location: null,
            plan_type: "explorer",
            subscription_status: "active",
          },
        })
      )
    );

    const user = userEvent.setup();
    const { onClose } = renderSigninModal(vi.fn(), { withSlowProductQuery: true });

    await user.type(screen.getByLabelText("Correo electrónico"), "renter.manual@appquilar.test");
    await user.type(screen.getByLabelText("Contraseña"), "Password123!");
    const signInButtons = screen.getAllByRole("button", { name: "Iniciar sesión" });
    await user.click(signInButtons[signInButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getByTestId("auth-user")).toHaveTextContent("Hola Renta Manual");
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
