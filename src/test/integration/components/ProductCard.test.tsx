import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";

import ProductCard from "@/components/products/ProductCard";
import { renderWithProviders } from "@/test/utils/renderWithProviders";

const product = {
    id: "product-1",
    internalId: "P-001",
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

describe("ProductCard integration", () => {
    it("shows real pricing for anonymous visitors", () => {
        renderWithProviders(<ProductCard product={product} />);

        expect(screen.getByText("Herramientas • 18€/día • 60€ fianza")).toBeInTheDocument();
        expect(screen.queryByTestId("product-card-public-price-mask")).not.toBeInTheDocument();
    });

    it("shows product identity and pricing together", () => {
        renderWithProviders(<ProductCard product={product} />);

        expect(screen.getByText("P-001")).toBeInTheDocument();
        expect(screen.getByText("Herramientas • 18€/día • 60€ fianza")).toBeInTheDocument();
        expect(screen.queryByTestId("product-card-public-price-mask")).not.toBeInTheDocument();
    });
});
