import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import ProductImageGallery from "@/components/products/ProductImageGallery";

describe("ProductImageGallery", () => {
  it("uses neutral copy when legacy public data has no images", () => {
    render(<ProductImageGallery images={[]} productName="Taladro premium" />);

    expect(screen.getByText("Taladro premium")).toBeInTheDocument();
    expect(
      screen.getByText("Este producto todavía no tiene imágenes disponibles.")
    ).toBeInTheDocument();
    expect(screen.queryByText(/Imagen pendiente de publicar/i)).not.toBeInTheDocument();
  });
});
