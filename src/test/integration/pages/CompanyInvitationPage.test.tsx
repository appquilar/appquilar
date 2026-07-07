import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const {
  mockUseCompanyInvitationStatus,
  mockUseAcceptCompanyInvitation,
  mockUseAuth,
  mockAcceptInvitation,
  mockLogin,
  mockLogout,
} = vi.hoisted(() => ({
  mockUseCompanyInvitationStatus: vi.fn(),
  mockUseAcceptCompanyInvitation: vi.fn(),
  mockUseAuth: vi.fn(),
  mockAcceptInvitation: vi.fn(),
  mockLogin: vi.fn(),
  mockLogout: vi.fn(),
}));

vi.mock("@/application/hooks/useCompanyInvitation", () => ({
  useCompanyInvitationStatus: mockUseCompanyInvitationStatus,
  useAcceptCompanyInvitation: mockUseAcceptCompanyInvitation,
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: mockUseAuth,
}));

import CompanyInvitationPage from "@/pages/CompanyInvitationPage";

const renderInvitationPage = (initialEntry: string) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/" element={<div>Inicio</div>} />
        <Route path="/company-invitation" element={<CompanyInvitationPage />} />
      </Routes>
    </MemoryRouter>
  );

describe("CompanyInvitationPage", () => {
  beforeEach(() => {
    mockUseCompanyInvitationStatus.mockReset();
    mockUseAcceptCompanyInvitation.mockReset();
    mockUseAuth.mockReset();
    mockAcceptInvitation.mockReset();
    mockLogin.mockReset();
    mockLogout.mockReset();

    mockUseAuth.mockReturnValue({
      currentUser: null,
      login: mockLogin,
      logout: mockLogout,
    });
    mockUseAcceptCompanyInvitation.mockReturnValue({
      mutateAsync: mockAcceptInvitation,
      isPending: false,
    });
    mockAcceptInvitation.mockResolvedValue(undefined);
    mockLogin.mockRejectedValue(new Error("login unavailable"));
  });

  it("allows accepting from email link params when the status preflight fails", async () => {
    mockUseCompanyInvitationStatus.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    const user = userEvent.setup();

    renderInvitationPage(
      "/company-invitation?company_id=company-1&token=seed-token&email=invitee@appquilar.test&company_name=Acme%20Rentals&role=ROLE_ADMIN"
    );

    expect(screen.queryByText("La invitación no existe o el enlace ya no es válido.")).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("invitee@appquilar.test")).toBeInTheDocument();
    expect(screen.getByText("Acme Rentals")).toBeInTheDocument();
    expect(screen.getByText("Administrador")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("Tu nombre"), "Ana");
    await user.type(screen.getByPlaceholderText("Tus apellidos"), "Lopez");
    await user.type(screen.getByPlaceholderText("Mínimo 8 caracteres"), "E2Epass!123");
    await user.click(screen.getByRole("button", { name: "Crear cuenta y aceptar invitación" }));

    await waitFor(() => {
      expect(mockAcceptInvitation).toHaveBeenCalledWith({
        companyId: "company-1",
        token: "seed-token",
        email: "invitee@appquilar.test",
        password: "E2Epass!123",
        firstName: "Ana",
        lastName: "Lopez",
      });
    });
  });

  it("keeps blocking invalid links without an invited email when status fails", () => {
    mockUseCompanyInvitationStatus.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    renderInvitationPage("/company-invitation?company_id=company-1&token=seed-token");

    expect(screen.getByText("La invitación no existe o el enlace ya no es válido.")).toBeInTheDocument();
  });

  it("blocks accepting with a logged-in account that does not match the invited email", async () => {
    mockUseAuth.mockReturnValue({
      currentUser: {
        id: "other-user",
        email: "other@appquilar.test",
        firstName: "Other",
        lastName: "User",
        roles: [],
        address: null,
        location: null,
      },
      login: mockLogin,
      logout: mockLogout,
    });
    mockUseCompanyInvitationStatus.mockReturnValue({
      data: {
        email: "invitee@appquilar.test",
        companyName: "Acme Rentals",
        role: "ROLE_CONTRIBUTOR",
        status: "PENDING",
        expiresAt: null,
        hasExistingAccount: true,
      },
      isLoading: false,
      isError: false,
    });

    const user = userEvent.setup();

    renderInvitationPage("/company-invitation?company_id=company-1&token=seed-token");

    expect(screen.getByText(/Esta invitación es para invitee@appquilar.test/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Aceptar invitación" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cerrar sesión y cambiar cuenta" }));

    expect(mockAcceptInvitation).not.toHaveBeenCalled();
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
