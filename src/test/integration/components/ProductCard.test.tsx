import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";

import { renderWithProviders } from "@/test/utils/renderWithProviders";

const useAuthMock = vi.fn();

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

const loadProductCard = async () => {
    vi.resetModules();
    vi.doMock("@/context/AuthContext", () => ({
        useAuth: () => useAuthMock(),
    }));

    return import("@/components/products/ProductCard");
};

describe("ProductCard integration", () => {
    beforeEach(() => {
        useAuthMock.mockReset();
    });

    it("blurs pricing for anonymous visitors", async () => {
        useAuthMock.mockReturnValue({ isAuthenticated: false });
        const { default: ProductCard } = await loadProductCard();

        renderWithProviders(<ProductCard product={product} />);

        expect(screen.getByTestId("product-card-public-price-mask")).toBeInTheDocument();
        expect(screen.queryByText("18€/día", { exact: false })).not.toBeInTheDocument();
    });

    it("shows real pricing for authenticated users", async () => {
        useAuthMock.mockReturnValue({ isAuthenticated: true });
        const { default: ProductCard } = await loadProductCard();

        renderWithProviders(<ProductCard product={product} />);

        expect(screen.getByText("P-001")).toBeInTheDocument();
        expect(screen.getByText("Herramientas • 18€/día • 60€ fianza")).toBeInTheDocument();
        expect(screen.queryByTestId("product-card-public-price-mask")).not.toBeInTheDocument();
    });
});
