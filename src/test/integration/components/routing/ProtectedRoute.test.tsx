import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import ProtectedRoute from "@/components/routing/ProtectedRoute";

const useAuthMock = vi.fn();

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

const HomeProbe = () => {
  const location = useLocation();
  const from =
    location.state &&
    typeof location.state === "object" &&
    "from" in location.state
      ? String(location.state.from)
      : "none";

  return (
    <div>
      <h1>Home</h1>
      <span data-testid="from-state">{from}</span>
    </div>
  );
};

const renderProtectedRoute = (initialEntry = "/dashboard") =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/" element={<HomeProbe />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>Private dashboard</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );

describe("ProtectedRoute", () => {
  it("shows the loading state while the session check is pending", () => {
    useAuthMock.mockReturnValue({
      currentUser: null,
      isLoading: true,
      authBlockMessage: null,
    });

    renderProtectedRoute();

    expect(screen.getByText("Comprobando tu sesión...")).toBeInTheDocument();
  });

  it("shows the backend access-block message instead of redirecting", async () => {
    const user = userEvent.setup();

    useAuthMock.mockReturnValue({
      currentUser: null,
      isLoading: false,
      authBlockMessage:
        "Hay un problema con la suscripción de tu empresa. Contacta con el gestor de la cuenta.",
    });

    renderProtectedRoute();

    expect(screen.getByRole("heading", { name: "Acceso restringido" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Hay un problema con la suscripción de tu empresa. Contacta con el gestor de la cuenta."
      )
    ).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Volver al inicio" }));

    expect(screen.getByRole("heading", { name: "Home" })).toBeInTheDocument();
  });

  it("redirects anonymous users to home and preserves the original destination", () => {
    useAuthMock.mockReturnValue({
      currentUser: null,
      isLoading: false,
      authBlockMessage: null,
    });

    renderProtectedRoute("/dashboard?tab=address");

    expect(screen.getByRole("heading", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByTestId("from-state")).toHaveTextContent("/dashboard?tab=address");
  });

  it("renders the protected content when the user is authenticated", () => {
    useAuthMock.mockReturnValue({
      currentUser: {
        id: "user-1",
        email: "victor@appquilar.com",
      },
      isLoading: false,
      authBlockMessage: null,
    });

    renderProtectedRoute();

    expect(screen.getByText("Private dashboard")).toBeInTheDocument();
  });
});
