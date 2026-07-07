import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CategorySelect from "@/components/dashboard/products/CategorySelect";

const useAllPlatformCategoriesMock = vi.fn();

vi.mock("@/application/hooks/useAllPlatformCategories", () => ({
  useAllPlatformCategories: () => useAllPlatformCategoriesMock(),
}));

describe("CategorySelect", () => {
  it("selects categories from the native select", async () => {
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
      />
    );

    await userEvent.selectOptions(screen.getByRole("combobox"), "cat-1");

    expect(onChange).toHaveBeenCalledWith("cat-1");
  });
});
