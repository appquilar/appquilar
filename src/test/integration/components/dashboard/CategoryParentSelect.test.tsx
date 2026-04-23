import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import CategoryParentSelect from "@/components/dashboard/categories/form/CategoryParentSelect";

const usePlatformCategoriesMock = vi.fn();
const useCategoryByIdMock = vi.fn();

vi.mock("@/application/hooks/usePlatformCategories", () => ({
    usePlatformCategories: () => usePlatformCategoriesMock(),
}));

vi.mock("@/application/hooks/useCategoryById", () => ({
    useCategoryById: (categoryId?: string | null) => useCategoryByIdMock(categoryId),
}));

describe("CategoryParentSelect", () => {
    it("shows the saved parent category even when it is outside the current result page", () => {
        const applyFilters = vi.fn();
        const setPerPage = vi.fn();

        usePlatformCategoriesMock.mockReturnValue({
            categories: [
                {
                    id: "cat-current",
                    name: "Amplificadores",
                    slug: "amplificadores",
                    parentId: "cat-parent",
                },
            ],
            isLoading: false,
            applyFilters,
            setPerPage,
        });

        useCategoryByIdMock.mockReturnValue({
            category: {
                id: "cat-parent",
                name: "Audio",
                slug: "audio",
                parentId: null,
            },
            isLoading: false,
            error: null,
        });

        render(
            <CategoryParentSelect
                value="cat-parent"
                onChange={vi.fn()}
                excludeCategoryId="cat-current"
            />
        );

        expect(useCategoryByIdMock).toHaveBeenCalledWith("cat-parent");
        expect(screen.getByRole("combobox")).toHaveTextContent("Audio");
        expect(screen.queryByText("Sin categoría padre")).not.toBeInTheDocument();
    });
});
