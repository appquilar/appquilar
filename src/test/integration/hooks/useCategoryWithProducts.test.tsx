import { describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { useCategoryWithProductsByText } from "@/application/hooks/useCategoryWithProducts";
import { createTestQueryClient } from "@/test/utils/renderWithProviders";

const { getBySlugMock, searchMock } = vi.hoisted(() => ({
    getBySlugMock: vi.fn(),
    searchMock: vi.fn(),
}));

vi.mock("@/compositionRoot", () => ({
    compositionRoot: {
        categoryService: {
            getBySlug: getBySlugMock,
        },
        productService: {
            search: searchMock,
        },
    },
}));

const createWrapper = () => {
    const queryClient = createTestQueryClient();
    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe("useCategoryWithProductsByText", () => {
    it("loads category products with dynamic filters and exposes available facets", async () => {
        getBySlugMock.mockResolvedValueOnce({
            id: "category-1",
            name: "Inflables",
            slug: "inflables",
        });

        searchMock.mockResolvedValueOnce({
            data: [],
            total: 0,
            page: 1,
            availableDynamicFilters: [
                {
                    code: "interior_exterior",
                    label: "Interior/Exterior",
                    type: "select",
                    options: [
                        {
                            value: "interior",
                            label: "Interior",
                            count: 2,
                            selected: true,
                        },
                    ],
                },
            ],
        });

        const { result } = renderHook(
            () =>
                useCategoryWithProductsByText(
                    "inflables",
                    "",
                    {},
                    {
                        propertyValues: {
                            interior_exterior: ["interior"],
                        },
                        propertyRanges: {
                            capacidad_personas: {
                                min: 10,
                                max: 40,
                            },
                        },
                    }
                ),
            {
                wrapper: createWrapper(),
            }
        );

        await waitFor(() => {
            expect(result.current.data?.category.id).toBe("category-1");
        });

        expect(getBySlugMock).toHaveBeenCalledWith("inflables");
        expect(searchMock).toHaveBeenCalledWith({
            text: undefined,
            categories: ["category-1"],
            latitude: undefined,
            longitude: undefined,
            radius: undefined,
            property_values: {
                interior_exterior: ["interior"],
            },
            property_ranges: {
                capacidad_personas: {
                    min: 10,
                    max: 40,
                },
            },
            page: 1,
            per_page: 50,
        });
        expect(result.current.data?.availableDynamicFilters).toEqual([
            {
                code: "interior_exterior",
                label: "Interior/Exterior",
                type: "select",
                options: [
                    {
                        value: "interior",
                        label: "Interior",
                        count: 2,
                        selected: true,
                    },
                ],
            },
        ]);
    });
});
