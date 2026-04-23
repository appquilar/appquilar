import { describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { usePublicCompanyProducts } from "@/application/hooks/usePublicCompanyProducts";
import { createTestQueryClient } from "@/test/utils/renderWithProviders";

const { listByCompanySlugMock } = vi.hoisted(() => ({
    listByCompanySlugMock: vi.fn(),
}));

vi.mock("@/compositionRoot", () => ({
    publicCompanyProductsService: {
        listByCompanySlug: listByCompanySlugMock,
    },
}));

const createWrapper = () => {
    const queryClient = createTestQueryClient();
    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe("usePublicCompanyProducts", () => {
    it("fetches published company products with pagination", async () => {
        listByCompanySlugMock.mockResolvedValueOnce({
            data: [],
            total: 0,
            page: 2,
        });

        const { result } = renderHook(() => usePublicCompanyProducts("alquileres-norte", 2, 12), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.data?.page).toBe(2);
        });

        expect(listByCompanySlugMock).toHaveBeenCalledWith("alquileres-norte", 2, 12);
    });

    it("does not fetch when company id is missing", async () => {
        const { result } = renderHook(() => usePublicCompanyProducts(null, 1, 12), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.fetchStatus).toBe("idle");
        });

        expect(listByCompanySlugMock).not.toHaveBeenCalled();
    });
});
