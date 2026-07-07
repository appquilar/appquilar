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
        <Route path="/dashboard" element={<div>Dashboard invitado</div>} />
        <Route path="/company-invitation" element={<CompanyInvitationPage />} />
      </Routes>
    </MemoryRouter>
  );

const pendingInvitation = (overrides: Record<string, unknown> = {}) => ({
  email: "invitee@appquilar.test",
  companyName: "Acme Rentals",
  role: "ROLE_CONTRIBUTOR",
  status: "PENDING",
  expiresAt: null,
  hasExistingAccount: false,
  ...overrides,
});

const renderPendingInvitation = (overrides: Record<string, unknown> = {}) => {
  mockUseCompanyInvitationStatus.mockReturnValue({
    data: pendingInvitation(overrides),
    isLoading: false,
    isError: false,
  });

  renderInvitationPage("/company-invitation?company_id=company-1&token=seed-token");
};

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

  it("lets users leave a status-error invitation page", async () => {
    mockUseCompanyInvitationStatus.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    const user = userEvent.setup();
    renderInvitationPage("/company-invitation?company_id=company-1&token=seed-token");

    await user.click(screen.getByRole("button", { name: "Volver al inicio" }));

    expect(screen.getByText("Inicio")).toBeInTheDocument();
  });

  it("shows the invalid-link state when required params are missing", async () => {
    mockUseCompanyInvitationStatus.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });

    const user = userEvent.setup();
    renderInvitationPage("/company-invitation?company_id=company-1");

    expect(screen.getByText("Falta `company_id` o `token` en el enlace.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Volver al inicio" }));

    expect(screen.getByText("Inicio")).toBeInTheDocument();
  });

  it("shows the loading state while checking the invitation", () => {
    mockUseCompanyInvitationStatus.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    renderInvitationPage("/company-invitation?company_id=company-1&token=seed-token");

    expect(screen.getByText("Comprobando invitación...")).toBeInTheDocument();
  });

  it("shows accepted invitations and lets the user go to the dashboard", async () => {
    mockUseCompanyInvitationStatus.mockReturnValue({
      data: pendingInvitation({ status: "ACCEPTED", hasExistingAccount: true }),
      isLoading: false,
      isError: false,
    });

    const user = userEvent.setup();
    renderInvitationPage("/company-invitation?company_id=company-1&token=seed-token");

    expect(screen.getByText(/Esta invitación ya fue aceptada/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ir al dashboard" }));

    expect(screen.getByText("Dashboard invitado")).toBeInTheDocument();
  });

  it.each([
    ["EXPIRED", "Esta invitación ha caducado. Solicita una nueva invitación."],
    ["SUSPENDED", "Esta invitación no está disponible. Contacta con un administrador de la empresa."],
  ])("blocks %s invitations", (status, message) => {
    mockUseCompanyInvitationStatus.mockReturnValue({
      data: pendingInvitation({ status }),
      isLoading: false,
      isError: false,
    });

    renderInvitationPage("/company-invitation?company_id=company-1&token=seed-token");

    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it("lets users leave an expired invitation page", async () => {
    mockUseCompanyInvitationStatus.mockReturnValue({
      data: pendingInvitation({ status: "EXPIRED" }),
      isLoading: false,
      isError: false,
    });

    const user = userEvent.setup();
    renderInvitationPage("/company-invitation?company_id=company-1&token=seed-token");

    await user.click(screen.getByRole("button", { name: "Volver al inicio" }));

    expect(screen.getByText("Inicio")).toBeInTheDocument();
  });

  it("blocks valid links when the invitation email is missing", async () => {
    mockUseCompanyInvitationStatus.mockReturnValue({
      data: pendingInvitation({ email: "" }),
      isLoading: false,
      isError: false,
    });

    const user = userEvent.setup();
    renderInvitationPage("/company-invitation?company_id=company-1&token=seed-token");

    expect(screen.getByText("Falta el email invitado en el enlace. Solicita una nueva invitación.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Volver al inicio" }));

    expect(screen.getByText("Inicio")).toBeInTheDocument();
  });

  it("lets anonymous invitees switch between existing-account and new-account forms", async () => {
    renderPendingInvitation();

    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Ya tengo cuenta" }));

    expect(screen.getByRole("button", { name: "Acceder y aceptar invitación" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(screen.getByRole("button", { name: "Crear cuenta y aceptar invitación" })).toBeInTheDocument();
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

  it("accepts the invitation with a logged-in matching account", async () => {
    mockUseAuth.mockReturnValue({
      currentUser: {
        id: "invitee-user",
        email: "INVITEE@appquilar.test",
        firstName: "Invited",
        lastName: "User",
        roles: [],
        address: null,
        location: null,
      },
      login: mockLogin,
      logout: mockLogout,
    });
    renderPendingInvitation({ hasExistingAccount: true });

    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Aceptar invitación" }));

    await waitFor(() => {
      expect(mockAcceptInvitation).toHaveBeenCalledWith({
        companyId: "company-1",
        token: "seed-token",
        email: null,
        password: null,
      });
    });
    expect(screen.getByText("Dashboard invitado")).toBeInTheDocument();
  });

  it("logs in existing invitees before accepting their invitation", async () => {
    mockLogin.mockResolvedValue(undefined);
    renderPendingInvitation({ hasExistingAccount: true });

    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Contraseña"), "Password123!");
    await user.click(screen.getByRole("button", { name: "Acceder y aceptar invitación" }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("invitee@appquilar.test", "Password123!");
    });
    expect(mockAcceptInvitation).toHaveBeenCalledWith({
      companyId: "company-1",
      token: "seed-token",
      email: null,
      password: null,
    });
    expect(screen.getByText("Dashboard invitado")).toBeInTheDocument();
  });

  it("switches new-account invitations to existing-account mode when the backend says the user exists", async () => {
    mockAcceptInvitation.mockRejectedValue({
      payload: {
        error: ["company.accept_invitation.user_already_exists"],
      },
    });
    renderPendingInvitation();

    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText("Tu nombre"), "Ana");
    await user.type(screen.getByPlaceholderText("Tus apellidos"), "Lopez");
    await user.type(screen.getByPlaceholderText("Mínimo 8 caracteres"), "Password123!");
    await user.click(screen.getByRole("button", { name: "Crear cuenta y aceptar invitación" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Acceder y aceptar invitación" })).toBeInTheDocument();
    });
    expect(screen.getByLabelText("Contraseña")).toHaveValue("Password123!");
  });

  it("shows server-side field errors when creating the invited account fails validation", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mockAcceptInvitation.mockRejectedValue({
      payload: {
        errors: {
          first_name: ["Nombre inválido"],
          last_name: ["Apellido inválido"],
          password: ["Contraseña inválida"],
        },
      },
    });
    renderPendingInvitation();

    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText("Tu nombre"), "Ana");
    await user.type(screen.getByPlaceholderText("Tus apellidos"), "Lopez");
    await user.type(screen.getByPlaceholderText("Mínimo 8 caracteres"), "Password123!");
    await user.click(screen.getByRole("button", { name: "Crear cuenta y aceptar invitación" }));

    expect(await screen.findByText("Nombre inválido")).toBeInTheDocument();
    expect(screen.getByText("Apellido inválido")).toBeInTheDocument();
    expect(screen.getByText("Contraseña inválida")).toBeInTheDocument();
  });

  it("falls back home when the new account is accepted but automatic login fails", async () => {
    renderPendingInvitation();

    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText("Tu nombre"), "Ana");
    await user.type(screen.getByPlaceholderText("Tus apellidos"), "Lopez");
    await user.type(screen.getByPlaceholderText("Mínimo 8 caracteres"), "Password123!");
    await user.click(screen.getByRole("button", { name: "Crear cuenta y aceptar invitación" }));

    await waitFor(() => {
      expect(mockAcceptInvitation).toHaveBeenCalledWith({
        companyId: "company-1",
        token: "seed-token",
        email: "invitee@appquilar.test",
        password: "Password123!",
        firstName: "Ana",
        lastName: "Lopez",
      });
    });
    expect(screen.getByText("Inicio")).toBeInTheDocument();
  });
});
