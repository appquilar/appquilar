import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";

import ProductCard from "@/components/products/ProductCard";
import { renderWithProviders } from "@/test/utils/renderWithProviders";

const useAuthMock = vi.fn();

vi.mock("@/context/AuthContext", () => ({
    useAuth: () => useAuthMock(),
}));

const product = {
    id: "product-1",
    name: "Taladro profesional",
    slug: "taladro-profesional",
    description: "Taladro industrial para obra.",
    imageUrl: "",
    thumbnailUrl: "",
    price: {
        daily: 18,
        deposit: 60,
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
};

describe("ProductCard", () => {
    it("blurs pricing for anonymous visitors", () => {
        useAuthMock.mockReturnValue({ isAuthenticated: false });

        renderWithProviders(<ProductCard product={product} />);

        expect(screen.getByTestId("product-card-public-price-mask")).toBeInTheDocument();
        expect(screen.queryByText("18€/día", { exact: false })).not.toBeInTheDocument();
    });

    it("shows real pricing for authenticated users", () => {
        useAuthMock.mockReturnValue({ isAuthenticated: true });

        renderWithProviders(<ProductCard product={product} />);

        expect(screen.getByText("Herramientas • 18€/día • 60€ fianza")).toBeInTheDocument();
        expect(screen.queryByTestId("product-card-public-price-mask")).not.toBeInTheDocument();
    });
});
