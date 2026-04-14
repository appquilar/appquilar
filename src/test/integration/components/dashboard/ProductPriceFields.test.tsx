import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DefaultValues, useForm } from "react-hook-form";

import ProductPriceFields from "@/components/dashboard/forms/ProductPriceFields";
import { Form } from "@/components/ui/form";
import {
  ProductFormValues,
  createEmptyPriceTier,
} from "@/components/dashboard/forms/productFormSchema";

const createDefaultValues = (): DefaultValues<ProductFormValues> => ({
  internalId: "",
  name: "Taladro profesional",
  slug: "taladro-profesional",
  description: "Taladro percutor",
  publicationStatus: "draft",
  quantity: 1,
  isRentalEnabled: true,
  price: {
    daily: 0,
    deposit: "",
    tiers: [createEmptyPriceTier()],
  },
  productType: "rental",
  category: {
    id: "cat-1",
    name: "Herramientas",
    slug: "herramientas",
  },
  images: [],
});

const ProductPriceFieldsHarness = () => {
  const form = useForm<ProductFormValues>({
    defaultValues: createDefaultValues(),
  });

  return (
    <Form {...form}>
      <ProductPriceFields control={form.control} />
    </Form>
  );
};

describe("ProductPriceFields", () => {
  it("starts with one tier, keeps the deposit blank and prevents removing the only tier", () => {
    render(<ProductPriceFieldsHarness />);

    const depositInput = screen.getByLabelText(/Fianza \(Depósito\)/i) as HTMLInputElement;
    const priceInput = screen.getByLabelText(/Precio por día/i) as HTMLInputElement;
    const removeButton = screen.getByRole("button", { name: /Eliminar tramo 1/i });

    expect(depositInput.value).toBe("");
    expect(priceInput.value).toBe("");
    expect(screen.queryByText(/Añade tramos de precio/i)).not.toBeInTheDocument();
    expect(removeButton).toBeDisabled();
  });

  it("lets users type decimal values naturally and adds new tiers with blank prices", async () => {
    const user = userEvent.setup();

    render(<ProductPriceFieldsHarness />);

    const depositInput = screen.getByLabelText(/Fianza \(Depósito\)/i) as HTMLInputElement;
    await user.type(depositInput, "12.5");
    expect(depositInput.value).toBe("12.5");

    await user.clear(depositInput);
    expect(depositInput.value).toBe("");

    await user.click(screen.getByRole("button", { name: /Añadir tramo/i }));

    const daysFromInputs = screen.getAllByLabelText(/Días desde/i) as HTMLInputElement[];
    const priceInputs = screen.getAllByLabelText(/Precio por día/i) as HTMLInputElement[];

    expect(daysFromInputs[1].value).toBe("2");
    expect(priceInputs[1].value).toBe("");

    await user.type(priceInputs[1], "23.75");
    expect(priceInputs[1].value).toBe("23.75");
  });
});
