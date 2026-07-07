import { beforeEach, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import ProtectedRoute from "@/components/routing/ProtectedRoute";
import { queryClient } from "@/composition/queryClient";
import { AuthProvider } from "@/context/AuthContext";
import { useRouteCurrentUserRefresh } from "@/hooks/useRouteCurrentUserRefresh";
import CompanyInvitationPage from "@/pages/CompanyInvitationPage";
import { server } from "@/test/mocks/server";

const apiBaseUrl = "http://localhost:8000";

const encodeBase64Url = (value: string): string =>
  btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

const makeJwt = (payload: Record<string, unknown>): string => {
  const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = encodeBase64Url(JSON.stringify(payload));
  return `${header}.${body}.signature`;
};

const RouteEffects = () => {
  useRouteCurrentUserRefresh();

  return null;
};

const renderInvitationFlow = () =>
  render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter
          initialEntries={[
            "/company-invitation?company_id=company-1&token=invite-token&email=invitee@appquilar.test",
          ]}
        >
          <RouteEffects />
          <Routes>
            <Route path="/" element={<div>Inicio</div>} />
            <Route path="/company-invitation" element={<CompanyInvitationPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>Dashboard invitado listo</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );

describe("CompanyInvitationPage authenticated flow", () => {
  beforeEach(() => {
    queryClient.clear();
    localStorage.clear();
    sessionStorage.clear();
  });

  it("keeps the invited contributor in the dashboard when the route refresh of /api/me fails transiently", async () => {
    const token = makeJwt({
      sub: "invited-user-1",
      roles: ["ROLE_USER"],
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    let meRequests = 0;

    server.use(
      http.get(`${apiBaseUrl}/api/companies/company-1/invitations/invite-token`, () =>
        HttpResponse.json({
          success: true,
          data: {
            email: "invitee@appquilar.test",
            company_name: "Mountain Pro Rentals",
            role: "ROLE_CONTRIBUTOR",
            status: "PENDING",
            expires_at: null,
            has_existing_account: false,
          },
        })
      ),
      http.post(`${apiBaseUrl}/api/companies/company-1/invitations/invite-token/accept`, async ({ request }) => {
        await expect(request.json()).resolves.toMatchObject({
          email: "invitee@appquilar.test",
          password: "Password123!",
          first_name: "Ana",
          last_name: "Lopez",
        });

        return new HttpResponse(null, { status: 204 });
      }),
      http.post(`${apiBaseUrl}/api/auth/login`, async ({ request }) => {
        await expect(request.json()).resolves.toEqual({
          email: "invitee@appquilar.test",
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

        if (meRequests === 2) {
          return HttpResponse.json(
            { success: false, message: "Company membership is still being projected" },
            { status: 500 }
          );
        }

        return HttpResponse.json({
          success: true,
          data: {
            id: "invited-user-1",
            first_name: "Ana",
            last_name: "Lopez",
            email: "invitee@appquilar.test",
            roles: ["ROLE_USER"],
            address: null,
            location: null,
            plan_type: "explorer",
            subscription_status: "active",
            company_context: {
              company_id: "company-1",
              company_name: "Mountain Pro Rentals",
              company_role: "ROLE_CONTRIBUTOR",
              is_company_owner: false,
              plan_type: "pro",
              subscription_status: "active",
              is_founding_account: false,
              product_slot_limit: 50,
              capabilities: {},
              entitlements: null,
            },
          },
        });
      })
    );

    const user = userEvent.setup();
    renderInvitationFlow();

    expect(await screen.findByDisplayValue("invitee@appquilar.test")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("Tu nombre"), "Ana");
    await user.type(screen.getByPlaceholderText("Tus apellidos"), "Lopez");
    await user.type(screen.getByPlaceholderText("Mínimo 8 caracteres"), "Password123!");
    await user.click(screen.getByRole("button", { name: "Crear cuenta y aceptar invitación" }));

    await waitFor(() => {
      expect(screen.getByText("Dashboard invitado listo")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(meRequests).toBe(2);
    });

    expect(screen.getByText("Dashboard invitado listo")).toBeInTheDocument();
    expect(screen.queryByText("Comprobando tu sesión...")).not.toBeInTheDocument();
    expect(queryClient.getQueryData(["currentUser"])).toMatchObject({
      companyContext: {
        companyRole: "ROLE_CONTRIBUTOR",
      },
    });
  });
});
