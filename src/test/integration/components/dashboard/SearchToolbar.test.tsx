import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SearchToolbar from "@/components/dashboard/products/SearchToolbar";
import { renderWithProviders } from "@/test/utils/renderWithProviders";
import type { ProductFilters } from "@/domain/repositories/ProductRepository";

vi.mock("@/components/dashboard/products/CategorySelect", () => ({
  default: ({
    value,
    onChange,
  }: {
    value: string | null;
    onChange: (value: string | null) => void;
  }) => (
    <button type="button" onClick={() => onChange(value ? null : "category-1")}>
      Categoria mock
    </button>
  ),
}));

const SearchToolbarHarness = () => {
  const [filters, setFilters] = useState<ProductFilters>({
    publicationStatus: ["draft", "published"],
  });

  return (
    <SearchToolbar
      filters={filters}
      onFilterChange={setFilters}
      onAddProduct={() => undefined}
      onSearch={(event) => event.preventDefault()}
    />
  );
};

describe("SearchToolbar", () => {
  it("uses draft + published by default and supports multi-selection", async () => {
    const user = userEvent.setup();

    renderWithProviders(<SearchToolbarHarness />);

    const statusButton = screen.getByRole("button", {
      name: /estado: borrador \+ publicado/i,
    });

    await user.click(statusButton);
    await user.click(screen.getByText("Archivado"));

    expect(
      screen.getByRole("button", {
        name: /estado: borrador, publicado, archivado/i,
      })
    ).toBeInTheDocument();

    await user.click(screen.getByTitle("Limpiar filtros"));

    expect(
      screen.getByRole("button", {
        name: /estado: borrador \+ publicado/i,
      })
    ).toBeInTheDocument();
  });
});
