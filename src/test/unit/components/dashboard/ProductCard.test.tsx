import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ProductCard from "@/components/dashboard/products/ProductCard";
import type { Product } from "@/domain/models/Product";
import { renderWithProviders } from "@/test/utils/renderWithProviders";

vi.mock("@/application/hooks/useMediaUrl", () => ({
  useMediaUrl: () => ({ url: null }),
}));

vi.mock("@/application/hooks/useProductInventory", () => ({
  getProductAvailabilityLabel: () => "Disponible",
  useProductRentability: () => ({
    availableQuantity: 1,
    isRentableNow: true,
  }),
}));

const buildProduct = (overrides: Partial<Product> = {}): Product => ({
  id: "product-1",
  internalId: "P-001",
  name: "Taladro premium",
  slug: "taladro-premium",
  description: "Taladro para obra.",
  quantity: 1,
  isRentalEnabled: true,
  isInventoryEnabled: false,
  inventoryMode: "unmanaged",
  imageUrl: "",
  thumbnailUrl: "",
  image_ids: [],
  publicationStatus: "draft",
  price: {
    daily: 12,
    deposit: 40,
    tiers: [
      {
        daysFrom: 1,
        pricePerDay: 12,
      },
    ],
  },
  category: {
    id: "category-1",
    name: "Herramientas",
    slug: "herramientas",
  },
  rating: 0,
  reviewCount: 0,
  productType: "rental",
  dynamicProperties: {},
  ...overrides,
});

describe("Dashboard ProductCard", () => {
  it("does not offer quick publish for a draft without images", async () => {
    const user = userEvent.setup();
    const onPublish = vi.fn();

    renderWithProviders(<ProductCard product={buildProduct()} onPublish={onPublish} />);

    const publishButton = screen.getByRole("button", {
      name: "Añade imágenes para publicar",
    });
    expect(publishButton).toBeDisabled();

    await user.click(publishButton);

    expect(onPublish).not.toHaveBeenCalled();
  });

  it("keeps quick publish available when the draft already has images", async () => {
    const user = userEvent.setup();
    const onPublish = vi.fn();

    renderWithProviders(
      <ProductCard product={buildProduct({ image_ids: ["image-1"] })} onPublish={onPublish} />
    );

    await user.click(screen.getByRole("button", { name: /Publicar/i }));

    expect(onPublish).toHaveBeenCalledTimes(1);
  });
});
