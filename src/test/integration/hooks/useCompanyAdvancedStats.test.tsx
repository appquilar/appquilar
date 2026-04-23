import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { useCompanyAdvancedStats } from "@/application/hooks/useCompanyAdvancedStats";

const getCompanyAdvancedStatsMock = vi.fn();

vi.mock("@/compositionRoot", () => ({
  companyAdvancedStatsService: {
    getCompanyAdvancedStats: (...args: unknown[]) => getCompanyAdvancedStatsMock(...args),
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
    queryClient,
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
};

describe("useCompanyAdvancedStats", () => {
  beforeEach(() => {
    getCompanyAdvancedStatsMock.mockReset();
  });

  it("stays idle when no company id is provided", async () => {
    const { result } = renderHook(() => useCompanyAdvancedStats(null), {
      wrapper: createWrapper().wrapper,
    });

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe("idle");
    });

    expect(getCompanyAdvancedStatsMock).not.toHaveBeenCalled();
  });

  it("stays idle when explicitly disabled", async () => {
    const { result } = renderHook(
      () =>
        useCompanyAdvancedStats(
          "company-1",
          {
            from: "2026-04-01",
            to: "2026-04-15",
          },
          false
        ),
      {
        wrapper: createWrapper().wrapper,
      }
    );

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe("idle");
    });

    expect(getCompanyAdvancedStatsMock).not.toHaveBeenCalled();
  });

  it("fetches advanced stats with the normalized query key and period", async () => {
    getCompanyAdvancedStatsMock.mockResolvedValue({
      summary: {
        totalViews: 128,
      },
    });

    const { result } = renderHook(
      () =>
        useCompanyAdvancedStats("company-1", {
          from: "2026-04-01",
          to: "2026-04-15",
        }),
      {
        wrapper: createWrapper().wrapper,
      }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual({
        summary: {
          totalViews: 128,
        },
      });
    });

    expect(getCompanyAdvancedStatsMock).toHaveBeenCalledWith("company-1", {
      from: "2026-04-01",
      to: "2026-04-15",
    });
  });
});
