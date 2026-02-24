import { describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { usePublicCompanyProfile } from "@/application/hooks/usePublicCompanyProfile";
import { createTestQueryClient } from "@/test/utils/renderWithProviders";

const { getBySlugMock } = vi.hoisted(() => ({
  getBySlugMock: vi.fn(),
}));

vi.mock("@/compositionRoot", () => ({
  publicCompanyProfileService: {
    getBySlug: getBySlugMock,
  },
}));

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: any }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("usePublicCompanyProfile", () => {
  it("fetches public company profile when slug exists", async () => {
    getBySlugMock.mockResolvedValueOnce({
      id: "company-1",
      name: "Alquileres Norte",
      slug: "alquileres-norte",
      description: null,
      profilePictureId: null,
      location: { city: null, state: null, country: null },
      trustMetrics: {
        activeProductsCount: 1,
        totalProductsCount: 2,
        completedRentalsCount: 3,
        totalRentsCount: 4,
        averageFirstResponseMinutes30d: 12,
        responseRate24h30d: 98,
        views30d: 100,
        uniqueVisitors30d: 80,
        loggedViews30d: 40,
        anonymousViews30d: 60,
      },
    });

    const { result } = renderHook(() => usePublicCompanyProfile("alquileres-norte"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data?.name).toBe("Alquileres Norte");
    });

    expect(getBySlugMock).toHaveBeenCalledWith("alquileres-norte");
  });

  it("does not fetch when slug is missing", async () => {
    const { result } = renderHook(() => usePublicCompanyProfile(null), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe("idle");
    });

    expect(getBySlugMock).not.toHaveBeenCalled();
  });
});
