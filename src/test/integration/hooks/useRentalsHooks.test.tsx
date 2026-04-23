import { describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTestQueryClient } from "@/test/utils/renderWithProviders";
import { useCreateLead, useOwnerRentalsCount, useRentSummary, useRentals } from "@/application/hooks/useRentals";

const { listRentsMock, getSummaryMock, createRentMock, createRentMessageMock } = vi.hoisted(() => ({
  listRentsMock: vi.fn(),
  getSummaryMock: vi.fn(),
  createRentMock: vi.fn(),
  createRentMessageMock: vi.fn(),
}));

vi.mock("@/compositionRoot", () => ({
  rentalService: {
    listRents: listRentsMock,
    getSummary: getSummaryMock,
    createRent: createRentMock,
    createRentMessage: createRentMessageMock,
  },
}));

vi.mock("@/application/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({
    user: {
      id: "user-1",
      email: "renter@appquilar.com",
    },
  }),
}));

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: any }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useRentals hooks", () => {
  it("maps paginated rentals response", async () => {
    listRentsMock.mockResolvedValueOnce({
      data: [{ id: "rent-1" }],
      total: 1,
      page: 1,
      perPage: 10,
    });

    const { result } = renderHook(() => useRentals({ role: "owner", page: 1, perPage: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.total).toBe(1);
      expect(result.current.rentals).toEqual([{ id: "rent-1" }]);
    });

    expect(listRentsMock).toHaveBeenCalledWith({ role: "owner", page: 1, perPage: 10 });
  });

  it("loads rent summary and derives the owner rentals count from it", async () => {
    getSummaryMock.mockResolvedValue({
      owner: {
        total: 11,
        upcoming: 7,
        past: 4,
      },
      renter: {
        total: 3,
        upcoming: 2,
        past: 1,
      },
    });

    const { result: summaryResult } = renderHook(
      () => useRentSummary({ ownerId: "owner-1" }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(summaryResult.current.data?.owner.total).toBe(11);
    });

    const { result } = renderHook(() => useOwnerRentalsCount({ ownerId: "owner-1" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBe(11);
    });

    expect(getSummaryMock).toHaveBeenCalledWith("owner-1");
  });

  it("creates rental lead and sends first message", async () => {
    createRentMock.mockResolvedValueOnce(undefined);
    createRentMessageMock.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useCreateLead(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        productId: "product-1",
        startDate: "2026-02-20",
        endDate: "2026-02-25",
        requestedQuantity: 2,
        deposit: { amount: 10000, currency: "EUR" },
        price: { amount: 50000, currency: "EUR" },
        message: "Hola, quiero alquilar",
      });
    });

    expect(createRentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: "product-1",
        renterEmail: "renter@appquilar.com",
        startDate: new Date(2026, 1, 20, 0, 0, 0),
        endDate: new Date(2026, 1, 25, 23, 59, 59),
        requestedQuantity: 2,
        isLead: true,
      })
    );

    const generatedRentId = createRentMock.mock.calls[0][0].rentId;
    expect(createRentMessageMock).toHaveBeenCalledWith(generatedRentId, {
      content: "Hola, quiero alquilar",
    });
  });
});
