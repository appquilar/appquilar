import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/components/auth/SignInForm", () => ({
  default: ({
    infoMessage,
    onForgotPassword,
  }: {
    infoMessage?: string | null;
    onForgotPassword?: () => void;
  }) => (
    <div data-testid="signin-form">
      <span>signin:{infoMessage ?? "none"}</span>
      <button type="button" onClick={onForgotPassword}>
        ¿Has olvidado tu contraseña?
      </button>
    </div>
  ),
}));

vi.mock("@/components/auth/SignUpForm", () => ({
  default: () => <div data-testid="signup-form">signup</div>,
}));

vi.mock("@/components/auth/ForgotPasswordForm", () => ({
  default: ({ onBack }: { onBack: () => void }) => (
    <div data-testid="forgot-form">
      forgot
      <button type="button" onClick={onBack}>
        Volver a iniciar sesión
      </button>
    </div>
  ),
}));

import AuthModal from "@/components/auth/AuthModal";

describe("AuthModal", () => {
  it("renders sign in tab by default", () => {
    render(<AuthModal isOpen onClose={vi.fn()} />);

    expect(screen.getByText("Accede a tu cuenta")).toBeInTheDocument();
    expect(screen.getByTestId("signin-form")).toHaveTextContent("signin:none");
  });

  it("switches between login/register and opens recovery from the forgot password link", async () => {
    render(<AuthModal isOpen onClose={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "Registrarse" }));
    expect(screen.getByTestId("signup-form")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));
    await userEvent.click(
      screen.getByRole("button", { name: "¿Has olvidado tu contraseña?" }),
    );
    expect(screen.getByTestId("forgot-form")).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Recuperar" }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Volver a iniciar sesión" }),
    );
    expect(screen.getByTestId("signin-form")).toBeInTheDocument();
  });

  it("reads info message from session storage when opening", () => {
    sessionStorage.setItem("auth:infoMessage", "Cuenta creada correctamente");

    render(<AuthModal isOpen onClose={vi.fn()} />);

    expect(screen.getByTestId("signin-form")).toHaveTextContent(
      "signin:Cuenta creada correctamente"
    );
    expect(sessionStorage.getItem("auth:infoMessage")).toBeNull();
  });
});
