import { describe, expect, it } from "vitest";

import {
  getBillingErrorMessage,
  STRIPE_CONNECTION_ERROR_MESSAGE,
} from "@/utils/billingError";

describe("billingError utils", () => {
  it("maps Stripe transport failures to a friendly message", () => {
    expect(
      getBillingErrorMessage(
        { payload: { error: ["billing.stripe.request_failed"] } },
        "Fallback"
      )
    ).toBe(STRIPE_CONNECTION_ERROR_MESSAGE);
  });

  it("also maps leaked raw Stripe DNS errors to the same friendly message", () => {
    expect(
      getBillingErrorMessage(
        new Error(
          'Could not resolve host: api.stripe.com for "https://api.stripe.com/v1/customers?email=test@example.com&limit=1".'
        ),
        "Fallback"
      )
    ).toBe(STRIPE_CONNECTION_ERROR_MESSAGE);
  });

  it("falls back to the original message for unrelated errors", () => {
    expect(
      getBillingErrorMessage(
        { payload: { error: ["billing.portal.configuration_missing.user"] } },
        "Fallback"
      )
    ).toBe("billing.portal.configuration_missing.user");
  });
});
