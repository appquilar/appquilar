import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation } from "react-router-dom";

import ProductForm from "@/components/dashboard/forms/ProductForm";
import type { Product } from "@/domain/models/Product";
import { renderWithProviders } from "@/test/utils/renderWithProviders";

const {
  onSubmitMock,
  inventoryFieldsSpy,
} = vi.hoisted(() => ({
  onSubmitMock: vi.fn(),
  inventoryFieldsSpy: vi.fn(({ enableInventoryQuery }: { enableInventoryQuery?: boolean }) => (
    <div data-testid="inventory-fields">inventory-fields-{String(enableInventoryQuery)}</div>
  )),
}));

vi.mock("@/components/dashboard/forms/hooks/useProductForm", async () => {
  const { useForm } = await import("react-hook-form");

  return {
    useProductForm: () => {
      const form = useForm({
        defaultValues: {
          internalId: "INV-001",
          name: "Castillo",
          slug: "castillo",
          description: "Inflable",
          imageUrl: "",
          thumbnailUrl: "",
          publicationStatus: "draft",
          quantity: 5,
          isRentalEnabled: true,
          isInventoryEnabled: true,
          inventoryMode: "managed_serialized",
          price: {
            daily: 100,
            deposit: "",
            tiers: [],
          },
          isRentable: true,
          isForSale: false,
          productType: "rental",
          category: {
            id: "cat-1",
            name: "Fiestas",
            slug: "fiestas",
          },
          currentTab: "general",
          images: [],
          dynamicProperties: {},
        },
      });

      return {
        form,
        isSubmitting: false,
        dynamicPropertyDefinitions: [],
        isDynamicPropertiesLoading: false,
        areDynamicPropertiesEnabled: false,
        onSubmit: onSubmitMock,
        onCancel: vi.fn(),
      };
    },
  };
});

vi.mock("@/components/dashboard/forms/ProductBasicInfoFields", () => ({
  default: () => <div>basic-fields</div>,
}));

vi.mock("@/components/dashboard/forms/ProductPriceFields", () => ({
  default: () => <div>price-fields</div>,
}));

vi.mock("@/components/dashboard/forms/ProductImagesField", () => ({
  default: () => <div>image-fields</div>,
}));

vi.mock("@/components/dashboard/forms/ProductDynamicPropertiesFields", () => ({
  default: () => <div>dynamic-fields</div>,
}));

vi.mock("@/components/dashboard/forms/ProductInventoryFields", () => ({
  default: inventoryFieldsSpy,
}));

const sampleProduct: Product = {
  id: "product-1",
  internalId: "INV-001",
  name: "Castillo inflable",
  slug: "castillo-inflable",
  description: "Inflable para fiestas",
  quantity: 5,
  isRentalEnabled: true,
  isInventoryEnabled: true,
  inventoryMode: "managed_serialized",
  imageUrl: "",
  thumbnailUrl: "",
  publicationStatus: "draft",
  price: {
    daily: 50,
    deposit: 100,
    tiers: [],
  },
  category: {
    id: "cat-1",
    name: "Fiestas",
    slug: "fiestas",
  },
  rating: 0,
  reviewCount: 0,
  dynamicProperties: {},
};

const LocationProbe = () => {
  const location = useLocation();

  return <div data-testid="location">{location.pathname}</div>;
};

describe("ProductForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the inventory section only when the inventory tab is opened", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <ProductForm
        product={sampleProduct}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        inventoryOwnerType="company"
        enableInventoryQuery
      />
    );

    expect(screen.getByText("basic-fields")).toBeInTheDocument();
    expect(screen.queryByTestId("inventory-fields")).not.toBeInTheDocument();
    expect(inventoryFieldsSpy).not.toHaveBeenCalled();

    await user.click(screen.getByRole("tab", { name: "Inventario" }));

    expect(screen.getByTestId("inventory-fields")).toHaveTextContent("inventory-fields-true");
    expect(inventoryFieldsSpy).toHaveBeenCalledTimes(1);
  });

  it("shows an inventory upgrade tab for non-company accounts and routes to the company wizard", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <>
        <ProductForm
          product={sampleProduct}
          onSave={vi.fn()}
          onCancel={vi.fn()}
          inventoryOwnerType="user"
          enableInventoryQuery
        />
        <LocationProbe />
      </>
    );

    expect(screen.getByRole("tab", { name: "General" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Inventario" })).toBeInTheDocument();
    expect(
      screen.getByText("Inventario sólo disponible en plan de Empresa")
    ).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Inventario" }));

    expect(screen.getByTestId("location")).toHaveTextContent("/dashboard/upgrade");
    expect(screen.queryByTestId("inventory-fields")).not.toBeInTheDocument();
    expect(inventoryFieldsSpy).not.toHaveBeenCalled();
  });
});
