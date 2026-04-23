import { describe, expect, it, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";

import {
  getUserProCheckoutErrorMessage,
  useUserProCheckout,
} from "@/hooks/useUserProCheckout";

const usePaymentPlansMock = vi.fn();

vi.mock("@/application/hooks/usePaymentPlans", () => ({
  usePaymentPlans: (...args: unknown[]) => usePaymentPlansMock(...args),
}));

describe("useUserProCheckout", () => {
  beforeEach(() => {
    usePaymentPlansMock.mockReset();
  });

  it("marks user pro as available when the checkout catalog contains a stripe billable", () => {
    usePaymentPlansMock.mockReturnValue({
      data: [
        {
          planCode: "user_pro",
          isCheckoutEnabled: true,
          price: {
            stripePriceId: "price_user_pro",
            stripeProductId: null,
          },
        },
      ],
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useUserProCheckout());

    expect(result.current.isCheckoutAvailable).toBe(true);
    expect(result.current.unavailableMessage).toBeNull();
  });

  it("returns a stripe configuration message when user pro has no billable id", () => {
    usePaymentPlansMock.mockReturnValue({
      data: [
        {
          planCode: "user_pro",
          isCheckoutEnabled: true,
          price: {
            stripePriceId: null,
            stripeProductId: null,
          },
        },
      ],
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useUserProCheckout());

    expect(result.current.isCheckoutAvailable).toBe(false);
    expect(result.current.unavailableMessage).toBe(
      "User Pro todavia no esta configurado para checkout en Stripe."
    );
  });

  it("reports loading, backend errors and missing plans with the public unavailable message", () => {
    usePaymentPlansMock
      .mockReturnValueOnce({
        data: [],
        isLoading: true,
        isError: false,
      })
      .mockReturnValueOnce({
        data: [],
        isLoading: false,
        isError: true,
      })
      .mockReturnValueOnce({
        data: [
          {
            planCode: "starter",
            isCheckoutEnabled: true,
            price: {
              stripePriceId: "price_starter",
              stripeProductId: null,
            },
          },
        ],
        isLoading: false,
        isError: false,
      })
      .mockReturnValueOnce({
        data: [
          {
            planCode: "user_pro",
            isCheckoutEnabled: false,
            price: {
              stripePriceId: "price_user_pro",
              stripeProductId: null,
            },
          },
        ],
        isLoading: false,
        isError: false,
      })
      .mockReturnValueOnce({
        data: [
          {
            planCode: "user_pro",
            isCheckoutEnabled: true,
            price: {
              stripePriceId: null,
              stripeProductId: "prod_user_pro",
            },
          },
        ],
        isLoading: false,
        isError: false,
      });

    expect(renderHook(() => useUserProCheckout()).result.current.unavailableMessage).toBe(
      "Estamos comprobando la disponibilidad de User Pro."
    );
    expect(renderHook(() => useUserProCheckout()).result.current.unavailableMessage).toBe(
      "User Pro no esta disponible para activar ahora mismo."
    );
    expect(renderHook(() => useUserProCheckout()).result.current.unavailableMessage).toBe(
      "User Pro no esta disponible para activar ahora mismo."
    );
    expect(renderHook(() => useUserProCheckout()).result.current.unavailableMessage).toBe(
      "User Pro no esta disponible para activar ahora mismo."
    );

    const stripeProductOnly = renderHook(() => useUserProCheckout());
    expect(stripeProductOnly.result.current.isCheckoutAvailable).toBe(true);
    expect(stripeProductOnly.result.current.unavailableMessage).toBeNull();
  });

  it("maps checkout-related backend codes to a friendlier error message", () => {
    expect(
      getUserProCheckoutErrorMessage(
        {
          payload: {
            error: ["billing.stripe.price_not_configured.user_pro"],
          },
        },
        "Fallback"
      )
    ).toBe("User Pro todavia no esta configurado para checkout en Stripe.");

    expect(
      getUserProCheckoutErrorMessage(
        {
          payload: {
            error: ["billing.plan_type.not_available"],
          },
        },
        "Fallback"
      )
    ).toBe("User Pro todavia no esta configurado para checkout en Stripe.");

    expect(
      getUserProCheckoutErrorMessage(
        {
          payload: {
            message: "Temporalmente no disponible",
          },
        },
        "Fallback"
      )
    ).toBe("Temporalmente no disponible");
  });
});
