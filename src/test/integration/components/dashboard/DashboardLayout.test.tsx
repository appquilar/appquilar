import { beforeEach, describe, expect, it, vi } from "vitest";
import { waitFor } from "@testing-library/react";

import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { renderWithProviders } from "@/test/utils/renderWithProviders";

vi.mock("@/hooks/useBillingReturnSync", () => ({
  useBillingReturnSync: () => undefined,
}));

vi.mock("@/components/dashboard/layout/CompanySubscriptionStatusNotice", () => ({
  default: () => null,
}));

vi.mock("@/components/dashboard/layout/UserSubscriptionStatusNotice", () => ({
  default: () => null,
}));

describe("DashboardLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("scrolls to hash targets after dashboard navigation", async () => {
    const scrollIntoViewMock = vi.spyOn(HTMLElement.prototype, "scrollIntoView");

    renderWithProviders(
      <DashboardLayout
        sidebar={<div>Sidebar</div>}
        content={<div id="user-subscription-settings">Subscription section</div>}
      />,
      {
        route: "/dashboard/config#user-subscription-settings",
      }
    );

    await waitFor(() => {
      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "start",
      });
    });
  });
});
