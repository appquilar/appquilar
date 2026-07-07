import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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

  it("wraps gallery navigation and allows direct image selection", async () => {
    const user = userEvent.setup();
    render(
      <ProductImageGallery
        images={["/cover.jpg", "/side.jpg", "/detail.jpg"]}
        productName="Taladro premium"
      />
    );

    expect(screen.getByAltText("Taladro premium - Imagen 1")).toBeInTheDocument();
    expect(screen.getByAltText("Miniatura 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ir a imagen 1" })).toHaveClass("w-2.5");

    await user.click(screen.getByRole("button", { name: "Imagen anterior" }));

    expect(screen.getByRole("button", { name: "Ir a imagen 3" })).toHaveClass("w-2.5");

    await user.click(screen.getByRole("button", { name: "Siguiente imagen" }));

    expect(screen.getByRole("button", { name: "Ir a imagen 1" })).toHaveClass("w-2.5");

    await user.click(screen.getByRole("button", { name: "Ir a imagen 2" }));

    expect(screen.getByRole("button", { name: "Ir a imagen 2" })).toHaveClass("w-2.5");
  });
});
