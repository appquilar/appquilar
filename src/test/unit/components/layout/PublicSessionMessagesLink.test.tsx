import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";

import PublicSessionMessagesLink from "@/components/layout/PublicSessionMessagesLink";
import { renderWithProviders } from "@/test/utils/renderWithProviders";

const useUnreadRentMessagesTotalMock = vi.fn();

vi.mock("@/application/hooks/useRentalMessages", () => ({
  useUnreadRentMessagesTotal: () => useUnreadRentMessagesTotalMock(),
}));

describe("PublicSessionMessagesLink", () => {
  it("renders the desktop link with the unread count badge", () => {
    useUnreadRentMessagesTotalMock.mockReturnValue({
      totalUnread: 3,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithProviders(<PublicSessionMessagesLink />);

    expect(
      screen.getByRole("link", { name: "Mensajes (3 pendientes)" })
    ).toHaveAttribute("href", "/dashboard/messages");
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders the mobile variant and keeps a neutral badge at zero", () => {
    useUnreadRentMessagesTotalMock.mockReturnValue({
      totalUnread: 0,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithProviders(<PublicSessionMessagesLink mobile />);

    expect(
      screen.getByRole("link", { name: "Mensajes (0 pendientes)" })
    ).toHaveAttribute("href", "/dashboard/messages");
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
