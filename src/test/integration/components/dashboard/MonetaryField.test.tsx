import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";

import { Form } from "@/components/ui/form";
import MonetaryField from "@/components/dashboard/rentals/form/components/MonetaryField";
import {
  RentalFormSubmitValues,
  RentalFormValues,
} from "@/domain/models/RentalForm";

const MonetaryFieldHarness = () => {
  const form = useForm<RentalFormValues, undefined, RentalFormSubmitValues>({
    defaultValues: {
      rentId: "rent-1",
      productId: "product-1",
      renterEmail: "cliente@ejemplo.com",
      renterName: "",
      startDate: new Date("2026-04-14T00:00:00.000Z"),
      endDate: new Date("2026-04-20T00:00:00.000Z"),
      priceAmount: "",
      priceCurrency: "EUR",
      depositAmount: "",
      depositCurrency: "EUR",
    },
  });

  return (
    <Form {...form}>
      <MonetaryField
        form={form}
        amountName="priceAmount"
        currencyName="priceCurrency"
        label="Precio del alquiler"
        description="Importe total del alquiler"
      />
    </Form>
  );
};

describe("MonetaryField", () => {
  it("lets users clear and type decimal values without forcing zero", async () => {
    const user = userEvent.setup();

    render(<MonetaryFieldHarness />);

    const amountInput = screen.getByLabelText(/Precio del alquiler/i) as HTMLInputElement;

    expect(amountInput.value).toBe("");

    await user.type(amountInput, "18.5");
    expect(amountInput.value).toBe("18.5");

    await user.clear(amountInput);
    expect(amountInput.value).toBe("");
  });
});
