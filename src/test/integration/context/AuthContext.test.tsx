import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiError } from "@/infrastructure/http/ApiClient";

const {
  mockInvalidateQueries,
  mockCreateCompany,
  mockAuthService,
} = vi.hoisted(() => ({
  mockInvalidateQueries: vi.fn(),
  mockCreateCompany: vi.fn(),
  mockAuthService: {
    getCurrentUser: vi.fn(),
    refreshCurrentUser: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    requestPasswordReset: vi.fn(),
    resetPassword: vi.fn(),
    getCurrentSession: vi.fn(),
    getCurrentSessionSync: vi.fn(),
    changePassword: vi.fn(),
  },
}));

vi.mock("@/compositionRoot", () => ({
  compositionRoot: {
    authService: mockAuthService,
    companyMembershipService: {
      createCompany: mockCreateCompany,
    },
  },
  queryClient: {
    invalidateQueries: mockInvalidateQueries,
  },
}));

import { AuthProvider, useAuth } from "@/context/AuthContext";

const AuthProbe = () => {
  const auth = useAuth();

  return (
    <div>
      <div data-testid="loading">{String(auth.isLoading)}</div>
      <div data-testid="authenticated">{String(auth.isAuthenticated)}</div>
      <div data-testid="email">{auth.currentUser?.email ?? "none"}</div>
      <div data-testid="block">{auth.authBlockMessage ?? "none"}</div>
      <button onClick={() => auth.login("victor@appquilar.com", "secret")}>login</button>
      <button onClick={() => auth.logout()}>logout</button>
    </div>
  );
};

describe("AuthContext", () => {
  it("loads current user on mount", async () => {
    mockAuthService.getCurrentUser.mockResolvedValueOnce({
      id: "user-1",
      firstName: "Victor",
      lastName: "Saavedra",
      email: "victor@appquilar.com",
      roles: ["ROLE_USER"],
      address: null,
      location: null,
    });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
      expect(screen.getByTestId("email")).toHaveTextContent("victor@appquilar.com");
    });
  });

  it("shows auth block message when backend returns inactive company subscription code", async () => {
    mockAuthService.getCurrentUser.mockRejectedValueOnce(
      new ApiError("blocked", 401, {
        error: ["subscription.company.inactive.contact_account_manager"],
      })
    );

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
      expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
      expect(screen.getByTestId("block")).toHaveTextContent(
        "Hay un problema con la suscripción de tu empresa. Contacta con el gestor de la cuenta."
      );
    });
  });

  it("logs in and out, invalidating currentUser query", async () => {
    mockAuthService.getCurrentUser
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: "user-1",
        firstName: "Victor",
        lastName: "Saavedra",
        email: "victor@appquilar.com",
        roles: ["ROLE_USER"],
        address: null,
        location: null,
      });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    await userEvent.click(screen.getByRole("button", { name: "login" }));

    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: "victor@appquilar.com",
        password: "secret",
      });
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    });

    await userEvent.click(screen.getByRole("button", { name: "logout" }));

    await waitFor(() => {
      expect(mockAuthService.logout).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
      expect(mockInvalidateQueries).toHaveBeenCalled();
    });
  });
});
