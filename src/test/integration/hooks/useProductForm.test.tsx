import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

import { useProductForm } from "@/application/hooks/useProductForm";
import type { Product } from "@/domain/models/Product";

vi.mock("@/compositionRoot", () => ({
  mediaService: {
    uploadImage: vi.fn(),
  },
}));

const createDraftProduct = (): Product => ({
  id: "550e8400-e29b-41d4-a716-446655440000",
  internalId: "",
  name: "",
  slug: "",
  description: "",
  quantity: 1,
  isRentalEnabled: true,
  imageUrl: "",
  thumbnailUrl: "",
  publicationStatus: "draft",
  price: {
    daily: 0,
    deposit: 0,
    tiers: [],
  },
  category: { id: "", name: "", slug: "" },
  rating: 0,
  reviewCount: 0,
  productType: "rental",
});

describe("useProductForm", () => {
  it("initializes new products with a first empty tier and blank deposit", () => {
    const { result } = renderHook(() =>
      useProductForm({
        product: createDraftProduct(),
        onSave: vi.fn(),
        onCancel: vi.fn(),
      })
    );

    expect(result.current.form.getValues("price.deposit")).toBe("");
    expect(result.current.form.getValues("price.tiers")).toEqual([
      {
        daysFrom: 1,
        daysTo: undefined,
        pricePerDay: "",
      },
    ]);
  });
});
