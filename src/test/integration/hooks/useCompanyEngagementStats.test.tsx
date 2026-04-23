import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { useCompanyEngagementStats } from "@/application/hooks/useCompanyEngagementStats";

const getCompanyStatsMock = vi.fn();

vi.mock("@/compositionRoot", () => ({
  companyEngagementService: {
    getCompanyStats: (...args: unknown[]) => getCompanyStatsMock(...args),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
};

describe("useCompanyEngagementStats", () => {
  beforeEach(() => {
    getCompanyStatsMock.mockReset();
  });

  it("does not fetch without a company id", async () => {
    const { result } = renderHook(() => useCompanyEngagementStats(undefined), {
      wrapper: createWrapper().wrapper,
    });

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe("idle");
    });

    expect(getCompanyStatsMock).not.toHaveBeenCalled();
  });

  it("loads engagement stats for the selected company and period", async () => {
    getCompanyStatsMock.mockResolvedValue({
      totals: {
        views: 321,
      },
    });

    const { result } = renderHook(
      () =>
        useCompanyEngagementStats("company-2", {
          from: "2026-03-01",
          to: "2026-03-31",
        }),
      {
        wrapper: createWrapper().wrapper,
      }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual({
        totals: {
          views: 321,
        },
      });
    });

    expect(getCompanyStatsMock).toHaveBeenCalledWith("company-2", {
      from: "2026-03-01",
      to: "2026-03-31",
    });
  });
});
