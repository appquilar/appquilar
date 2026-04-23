import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductCard from "@/components/products/ProductCard";
import { renderWithProviders } from "@/test/utils/renderWithProviders";

const useAuthMock = vi.fn();

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

const buildProduct = () => ({
  id: "product-1",
  internalId: "P-001",
  name: "Taladro profesional",
  slug: "taladro-profesional",
  description: "Taladro industrial para obra.",
  imageUrl: "",
  thumbnailUrl: "",
  price: {
    daily: 0,
  },
  company: {
    id: "company-1",
    name: "Appquilar Tools",
    slug: "appquilar-tools",
  },
  category: {
    id: "category-1",
    name: "Herramientas",
    slug: "herramientas",
  },
  rating: 0,
  reviewCount: 0,
});

describe("ProductCard behavior", () => {
  it("falls back to the placeholder image and consultation text when price data is incomplete", () => {
    useAuthMock.mockReturnValue({ isAuthenticated: true });

    renderWithProviders(<ProductCard product={buildProduct()} />);

    expect(screen.getByRole("img", { name: "Taladro profesional" })).toHaveAttribute(
      "src",
      "/placeholder.svg"
    );
    expect(screen.getByText("Herramientas • Precio a consultar")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver producto" })).toHaveAttribute(
      "href",
      "/producto/taladro-profesional"
    );
  });

  it("shows the first priced tier when the base tier requires consultation", () => {
    useAuthMock.mockReturnValue({ isAuthenticated: true });

    renderWithProviders(
      <ProductCard
        product={{
          ...buildProduct(),
          price: {
            daily: 0,
            deposit: 60,
            tiers: [
              {
                daysFrom: 1,
                daysTo: 3,
                pricePerDay: 0,
              },
              {
                daysFrom: 4,
                daysTo: undefined,
                pricePerDay: 18,
              },
            ],
          },
        }}
      />
    );

    expect(screen.getByText("Herramientas • Desde 18€/día • 60€ fianza")).toBeInTheDocument();
  });

  it("shows the internal id badge and calls edit/delete actions with the product id", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    useAuthMock.mockReturnValue({ isAuthenticated: true });

    renderWithProviders(
      <ProductCard product={buildProduct()} onEdit={onEdit} onDelete={onDelete} />
    );

    expect(screen.getByText("P-001")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Editar" }));
    await user.click(screen.getByRole("button", { name: "Eliminar" }));

    expect(onEdit).toHaveBeenCalledWith("product-1");
    expect(onDelete).toHaveBeenCalledWith("product-1");
  });
});
