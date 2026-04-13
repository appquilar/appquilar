import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CategorySelect from "@/components/dashboard/products/CategorySelect";

const useAllPlatformCategoriesMock = vi.fn();

vi.mock("@/application/hooks/useAllPlatformCategories", () => ({
  useAllPlatformCategories: () => useAllPlatformCategoriesMock(),
}));

describe("CategorySelect", () => {
  it("filters categories without being sensitive to case or accents", async () => {
    const onChange = vi.fn();

    useAllPlatformCategoriesMock.mockReturnValue({
      categories: [
        { id: "cat-1", name: "Cámping", slug: "camping", parentId: null },
        { id: "cat-2", name: "Herramientas", slug: "herramientas", parentId: null },
      ],
      isLoading: false,
      error: null,
    });

    render(
      <CategorySelect
        value={null}
        onChange={onChange}
        placeholder="Seleccionar categoría del producto"
        searchPlaceholder="Buscar categoría por nombre..."
      />
    );

    await userEvent.click(screen.getByRole("combobox"));

    const input = screen.getByPlaceholderText("Buscar categoría por nombre...");
    await userEvent.type(input, "camping");

    expect(screen.getByText("Cámping")).toBeInTheDocument();
    expect(screen.queryByText("Herramientas")).not.toBeInTheDocument();

    await userEvent.click(screen.getByText("Cámping"));

    expect(onChange).toHaveBeenCalledWith("cat-1");
  });
});
