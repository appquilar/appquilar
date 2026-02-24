import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { useActiveProductsCount, useDashboardProducts, useOwnedProductsCount } from "@/application/hooks/useProducts";
import { createTestQueryClient } from "@/test/utils/renderWithProviders";

const { listByOwnerPaginatedMock } = vi.hoisted(() => ({
  listByOwnerPaginatedMock: vi.fn(),
}));

vi.mock("@/compositionRoot", () => ({
  productService: {
    listByOwnerPaginated: listByOwnerPaginatedMock,
  },
}));

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useProducts hooks", () => {
  it("loads dashboard products with owner and filters", async () => {
    listByOwnerPaginatedMock.mockResolvedValueOnce({
      data: [{ id: "p1", name: "Taladro" }],
      total: 1,
      page: 2,
      perPage: 10,
    });

    const { result } = renderHook(
      () =>
        useDashboardProducts({
          ownerId: "owner-1",
          ownerType: "company",
          page: 2,
          perPage: 10,
          filters: { publicationStatus: "published" },
        }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.data?.total).toBe(1);
    });

    expect(listByOwnerPaginatedMock).toHaveBeenCalledWith(
      "owner-1",
      "company",
      2,
      10,
      { publicationStatus: "published" }
    );
  });

  it("gets owned products count using total", async () => {
    listByOwnerPaginatedMock.mockResolvedValueOnce({
      data: [{ id: "p1" }],
      total: 23,
      page: 1,
      perPage: 1,
    });

    const { result } = renderHook(
      () => useOwnedProductsCount({ ownerId: "owner-1", ownerType: "user" }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.data).toBe(23);
    });

    expect(listByOwnerPaginatedMock).toHaveBeenCalledWith("owner-1", "user", 1, 1, undefined);
  });

  it("gets active products count filtering publicationStatus=published", async () => {
    listByOwnerPaginatedMock.mockResolvedValueOnce({
      data: [],
      total: 5,
      page: 1,
      perPage: 1,
    });

    const { result } = renderHook(
      () => useActiveProductsCount({ ownerId: "owner-1", ownerType: "company" }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.data).toBe(5);
    });

    expect(listByOwnerPaginatedMock).toHaveBeenCalledWith("owner-1", "company", 1, 1, {
      publicationStatus: "published",
    });
  });
});
