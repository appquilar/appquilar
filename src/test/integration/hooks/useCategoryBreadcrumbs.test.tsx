import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCategoryBreadcrumbs } from "@/application/hooks/useCategoryBreadcrumbs";
import { createTestQueryClient } from "@/test/utils/renderWithProviders";

const { getBreadcrumbsMock } = vi.hoisted(() => ({
    getBreadcrumbsMock: vi.fn(),
}));

vi.mock("@/compositionRoot", () => ({
    compositionRoot: {
        categoryService: {
            getBreadcrumbs: getBreadcrumbsMock,
        },
    },
}));

const createWrapper = () => {
    const queryClient = createTestQueryClient();

    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe("useCategoryBreadcrumbs", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("loads the category hierarchy for a leaf category", async () => {
        getBreadcrumbsMock.mockResolvedValueOnce([
            {
                id: "category-root",
                name: "Deportes acuaticos",
                slug: "deportes-acuaticos",
                parentId: null,
                depth: 1,
            },
            {
                id: "category-leaf",
                name: "Snorkel",
                slug: "snorkel",
                parentId: "category-root",
                depth: 2,
            },
        ]);

        const { result } = renderHook(() => useCategoryBreadcrumbs("category-leaf"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.data).toHaveLength(2);
        });

        expect(getBreadcrumbsMock).toHaveBeenCalledWith("category-leaf");
        expect(result.current.data?.map((item) => item.name)).toEqual([
            "Deportes acuaticos",
            "Snorkel",
        ]);
    });

    it("does not query while there is no category id", () => {
        renderHook(() => useCategoryBreadcrumbs(null), {
            wrapper: createWrapper(),
        });

        expect(getBreadcrumbsMock).not.toHaveBeenCalled();
    });
});
