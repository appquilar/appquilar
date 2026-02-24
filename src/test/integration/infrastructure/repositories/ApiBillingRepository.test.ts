import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";
import { ApiBillingRepository } from "@/infrastructure/repositories/ApiBillingRepository";
import { ApiClient } from "@/infrastructure/http/ApiClient";
import { createAuthSession } from "@/domain/models/AuthSession";

const apiBaseUrl = "http://localhost:8000";

describe("ApiBillingRepository integration", () => {
  it("creates stripe checkout session for company plan", async () => {
    server.use(
      http.post(`${apiBaseUrl}/api/billing/checkout-session`, async ({ request }) => {
        const body = await request.json();

        expect(body).toEqual({
          scope: "company",
          plan_type: "pro",
          success_url: "http://localhost:8080/success",
          cancel_url: "http://localhost:8080/cancel",
        });
        expect(request.headers.get("authorization")).toBe("Bearer jwt-token");

        return HttpResponse.json({
          success: true,
          data: {
            url: "https://checkout.stripe.test/session",
          },
        });
      })
    );

    const repository = new ApiBillingRepository(
      new ApiClient({ baseUrl: apiBaseUrl }),
      () => createAuthSession({ token: "jwt-token" })
    );

    const result = await repository.createCheckoutSession({
      scope: "company",
      planType: "pro",
      successUrl: "http://localhost:8080/success",
      cancelUrl: "http://localhost:8080/cancel",
    });

    expect(result.url).toBe("https://checkout.stripe.test/session");
  });

  it("creates customer portal session and maps response", async () => {
    server.use(
      http.post(`${apiBaseUrl}/api/billing/customer-portal-session`, async ({ request }) => {
        const body = await request.json();

        expect(body).toEqual({
          scope: "user",
          return_url: "http://localhost:8080/dashboard/config",
        });

        return HttpResponse.json({
          success: true,
          data: {
            url: "https://billing.stripe.test/portal",
          },
        });
      })
    );

    const repository = new ApiBillingRepository(
      new ApiClient({ baseUrl: apiBaseUrl }),
      () => createAuthSession({ token: "jwt-token" })
    );

    const result = await repository.createCustomerPortalSession({
      scope: "user",
      returnUrl: "http://localhost:8080/dashboard/config",
    });

    expect(result.url).toBe("https://billing.stripe.test/portal");
  });
});
