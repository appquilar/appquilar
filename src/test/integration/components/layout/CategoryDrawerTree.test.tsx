import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CategoryDrawerTree } from "@/components/layout/CategoryDrawerTree";
import { renderWithProviders } from "@/test/utils/renderWithProviders";

const categories = [
  {
    id: "cat-1",
    name: "Vehículos",
    slug: "vehiculos",
    parentId: null,
    iconName: null,
  },
  {
    id: "cat-2",
    name: "Accesorios",
    slug: "accesorios",
    parentId: "cat-1",
    iconName: null,
  },
  {
    id: "cat-3",
    name: "Remolques",
    slug: "remolques",
    parentId: "cat-1",
    iconName: null,
  },
  {
    id: "cat-4",
    name: "Huérfana",
    slug: "huerfana",
    parentId: "missing-parent",
    iconName: null,
  },
];

describe("CategoryDrawerTree", () => {
  it("renders the category tree, expands nested nodes and notifies navigation callbacks", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    renderWithProviders(
      <CategoryDrawerTree categories={categories} isOpen={true} onNavigate={onNavigate} />
    );

    expect(screen.getByText("Todas las categorías")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Vehículos" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Huérfana" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Accesorios" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Expandir" }));

    const accesoriosLink = screen.getByRole("link", { name: "Accesorios" });
    expect(accesoriosLink).toHaveAttribute("href", "/categoria/accesorios");

    await user.click(accesoriosLink);
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it("searches by slug, renders breadcrumbs and shows a clear empty state when there are no matches", async () => {
    const user = userEvent.setup();

    renderWithProviders(<CategoryDrawerTree categories={categories} isOpen={true} />);

    const searchInput = screen.getByPlaceholderText("Buscar categoría...");
    await user.type(searchInput, "remo");

    expect(screen.getByText("Resultados")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Remolques/ })).toBeInTheDocument();
    expect(screen.getByText("Vehículos > Remolques")).toBeInTheDocument();

    await user.clear(searchInput);
    await user.type(searchInput, "sin coincidencias");

    expect(screen.getByText('No hay resultados para “sin coincidencias”.')).toBeInTheDocument();
  });
});
