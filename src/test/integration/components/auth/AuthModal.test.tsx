import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/components/auth/SignInForm", () => ({
  default: ({
    infoMessage,
    onForgotPassword,
    onSuccess,
  }: {
    infoMessage?: string | null;
    onForgotPassword?: () => void;
    onSuccess?: () => void;
  }) => (
    <div data-testid="signin-form">
      <span>signin:{infoMessage ?? "none"}</span>
      <button type="button" onClick={onForgotPassword}>
        ¿Has olvidado tu contraseña?
      </button>
      <button type="button" onClick={onSuccess}>
        Completar acceso
      </button>
    </div>
  ),
}));

vi.mock("@/components/auth/SignUpForm", () => ({
  default: ({ onSuccess }: { onSuccess?: () => void }) => (
    <div data-testid="signup-form">
      signup
      <button type="button" onClick={onSuccess}>
        Completar registro
      </button>
    </div>
  ),
}));

vi.mock("@/components/auth/ForgotPasswordForm", () => ({
  default: ({ onBack, onSuccess }: { onBack: () => void; onSuccess?: () => void }) => (
    <div data-testid="forgot-form">
      forgot
      <button type="button" onClick={onBack}>
        Volver a iniciar sesión
      </button>
      <button type="button" onClick={onSuccess}>
        Enviar recuperación
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

  it("reads info message from session storage when opening, including password-change messages", () => {
    sessionStorage.setItem("auth:postChangePasswordMessage", "Contraseña actualizada");

    render(<AuthModal isOpen onClose={vi.fn()} />);

    expect(screen.getByTestId("signin-form")).toHaveTextContent(
      "signin:Contraseña actualizada"
    );
    expect(sessionStorage.getItem("auth:postChangePasswordMessage")).toBeNull();
  });

  it("can open directly on the signup tab when requested from session storage", () => {
    sessionStorage.setItem("auth:initialTab", "signup");

    render(<AuthModal isOpen onClose={vi.fn()} />);

    expect(screen.getByTestId("signup-form")).toBeInTheDocument();
    expect(sessionStorage.getItem("auth:initialTab")).toBeNull();
  });

  it("returns to login with a success message after signup and password recovery", async () => {
    render(<AuthModal isOpen onClose={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "Registrarse" }));
    await userEvent.click(screen.getByRole("button", { name: "Completar registro" }));
    expect(screen.getByTestId("signin-form")).toHaveTextContent(
      "signin:Tu cuenta se ha creado correctamente. Ahora puedes iniciar sesión con tu correo y contraseña."
    );

    await userEvent.click(
      screen.getByRole("button", { name: "¿Has olvidado tu contraseña?" })
    );
    await userEvent.click(screen.getByRole("button", { name: "Enviar recuperación" }));
    expect(screen.getByTestId("signin-form")).toHaveTextContent(
      "signin:Te hemos enviado un correo con instrucciones para restablecer tu contraseña."
    );
  });

  it("calls onClose when the dialog close button is pressed", async () => {
    const onClose = vi.fn();

    render(<AuthModal isOpen onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "Cerrar" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
