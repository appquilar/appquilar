import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";

import ProductInfo from "@/components/products/ProductInfo";
import { renderWithProviders } from "@/test/utils/renderWithProviders";

vi.mock("@/application/hooks/useProductInventory", () => ({
    useProductRentability: () => ({
        availabilityTone: "success",
        availabilityLabel: "Disponible",
        availabilityMessage: "Disponible para alquilar.",
        isRentableNow: true,
    }),
}));

vi.mock("@/hooks/useAuthModalLauncher", () => ({
    useAuthModalLauncher: () => ({
        openSignIn: vi.fn(),
        openSignUp: vi.fn(),
    }),
}));

vi.mock("@/components/products/ProductRentalCostCalculator", () => ({
    default: () => <div data-testid="rental-calculator">calculator</div>,
}));

vi.mock("@/components/products/CompanyInfo", () => ({
    default: ({ isLoggedIn }: { isLoggedIn: boolean }) => (
        <div data-testid="company-info">{isLoggedIn ? "company-auth" : "company-guest"}</div>
    ),
}));

const baseProps = {
    product: {
        id: "product-1",
        name: "Taladro premium",
        publicationStatus: "published",
        quantity: 1,
        isRentalEnabled: true,
        inventorySummary: null,
        category: {
            id: "category-1",
            name: "Herramientas",
            slug: "herramientas",
        },
        company: {
            id: "company-1",
            name: "Appquilar Tools",
            slug: "appquilar-tools",
        },
        price: {
            daily: 24.5,
            deposit: 80,
            tiers: [
                {
                    daysFrom: 1,
                    daysTo: 3,
                    pricePerDay: 24.5,
                },
            ],
        },
        providerLocationLabel: "Madrid",
    },
    onContact: vi.fn(),
    leadStartDate: "2026-04-20",
    leadEndDate: "2026-04-22",
    leadRequestedQuantity: 1,
    onLeadStartDateChange: vi.fn(),
    onLeadEndDateChange: vi.fn(),
    onLeadRequestedQuantityChange: vi.fn(),
    onLeadCalculationChange: vi.fn(),
};

describe("ProductInfo", () => {
    it("shows the guest CTA and hides rental operations for anonymous users", () => {
        renderWithProviders(
            <ProductInfo
                {...baseProps}
                isLoggedIn={false}
            />
        );

        expect(
            screen.getByText("Crea tu cuenta para ver tarifas, calcular el alquiler y contactar con el proveedor.")
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Crear cuenta gratis" })).toBeInTheDocument();
        expect(screen.queryByTestId("rental-calculator")).not.toBeInTheDocument();
        expect(screen.getByTestId("company-info")).toHaveTextContent("company-guest");
    });

    it("shows pricing and rental operations for authenticated users", () => {
        renderWithProviders(
            <ProductInfo
                {...baseProps}
                isLoggedIn={true}
            />
        );

        expect(screen.getAllByText("24.50€").length).toBeGreaterThan(0);
        expect(screen.getByText("80.00€")).toBeInTheDocument();
        expect(screen.getByTestId("rental-calculator")).toBeInTheDocument();
        expect(screen.getByTestId("company-info")).toHaveTextContent("company-auth");
    });
});
