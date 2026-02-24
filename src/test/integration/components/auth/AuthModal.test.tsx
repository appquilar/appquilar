import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/components/auth/SignInForm", () => ({
  default: ({ infoMessage }: { infoMessage?: string | null }) => (
    <div data-testid="signin-form">signin:{infoMessage ?? "none"}</div>
  ),
}));

vi.mock("@/components/auth/SignUpForm", () => ({
  default: () => <div data-testid="signup-form">signup</div>,
}));

vi.mock("@/components/auth/ForgotPasswordForm", () => ({
  default: () => <div data-testid="forgot-form">forgot</div>,
}));

import AuthModal from "@/components/auth/AuthModal";

describe("AuthModal", () => {
  it("renders sign in tab by default", () => {
    render(<AuthModal isOpen onClose={vi.fn()} />);

    expect(screen.getByText("Accede a tu cuenta")).toBeInTheDocument();
    expect(screen.getByTestId("signin-form")).toHaveTextContent("signin:none");
  });

  it("switches segmented tabs between login/register/recover", async () => {
    render(<AuthModal isOpen onClose={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "Registrarse" }));
    expect(screen.getByTestId("signup-form")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Recuperar" }));
    expect(screen.getByTestId("forgot-form")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));
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
