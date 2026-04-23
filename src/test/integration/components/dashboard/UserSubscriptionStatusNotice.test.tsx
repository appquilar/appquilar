import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import UserSubscriptionStatusNotice from "@/components/dashboard/layout/UserSubscriptionStatusNotice";
import { renderWithProviders } from "@/test/utils/renderWithProviders";
import { UserRole } from "@/domain/models/UserRole";

const useAuthMock = vi.fn();

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

describe("UserSubscriptionStatusNotice", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
  });

  it("links canceled user notices to the subscription section in config", () => {
    useAuthMock.mockReturnValue({
      currentUser: {
        id: "user-1",
        roles: [UserRole.REGULAR_USER],
        companyId: null,
        companyContext: null,
        subscriptionStatus: "canceled",
      },
      hasRole: vi.fn().mockReturnValue(false),
    });

    renderWithProviders(<UserSubscriptionStatusNotice />, {
      route: "/dashboard",
    });

    expect(
      screen.getByRole("link", { name: "Abrir suscripcion" })
    ).toHaveAttribute("href", "/dashboard/config#user-subscription-settings");
  });

  it("scrolls directly to the subscription section when already on config", async () => {
    const user = userEvent.setup();
    const scrollIntoViewMock = vi.spyOn(HTMLElement.prototype, "scrollIntoView");

    useAuthMock.mockReturnValue({
      currentUser: {
        id: "user-1",
        roles: [UserRole.REGULAR_USER],
        companyId: null,
        companyContext: null,
        subscriptionStatus: "canceled",
      },
      hasRole: vi.fn().mockReturnValue(false),
    });

    renderWithProviders(
      <>
        <UserSubscriptionStatusNotice />
        <div id="user-subscription-settings">Suscripcion</div>
      </>,
      {
        route: "/dashboard/config",
      }
    );

    await user.click(screen.getByRole("link", { name: "Abrir suscripcion" }));

    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
  });

  it("shows the notice when cancellation is scheduled at period end", () => {
    useAuthMock.mockReturnValue({
      currentUser: {
        id: "user-1",
        roles: [UserRole.REGULAR_USER],
        companyId: null,
        companyContext: null,
        planType: "user_pro",
        subscriptionStatus: "active",
        subscriptionCancelAtPeriodEnd: true,
      },
      hasRole: vi.fn().mockReturnValue(false),
    });

    renderWithProviders(<UserSubscriptionStatusNotice />, {
      route: "/dashboard",
    });

    expect(
      screen.getByText("Tu suscripcion User Pro terminara al final del periodo actual")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Abrir suscripcion" })
    ).toHaveAttribute("href", "/dashboard/config#user-subscription-settings");
  });
});
