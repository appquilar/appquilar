import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";
import { ApiClient } from "@/infrastructure/http/ApiClient";
import { ApiPublicCompanyProfileRepository } from "@/infrastructure/repositories/ApiPublicCompanyProfileRepository";

const apiBaseUrl = "http://localhost:8000";

describe("ApiPublicCompanyProfileRepository integration", () => {
  it("fetches and maps public company profile from API", async () => {
    server.use(
      http.get(`${apiBaseUrl}/api/public/companies/:slug`, ({ params }) => {
        expect(params.slug).toBe("appquilar-tools");

        return HttpResponse.json({
          success: true,
          data: {
            company_id: "company-1",
            name: "Appquilar Tools",
            slug: "appquilar-tools",
            location: {
              city: "Alicante",
              state: "Comunitat Valenciana",
              country: "ES",
            },
            trust_metrics: {
              active_products_count: 12,
              total_products_count: 20,
              completed_rentals_count: 90,
              total_rents_count: 110,
              average_first_response_minutes_30d: 24,
              response_rate_24h_30d: 94,
              views_30d: 540,
              unique_visitors_30d: 430,
              logged_views_30d: 300,
              anonymous_views_30d: 240,
            },
          },
        });
      })
    );

    const repository = new ApiPublicCompanyProfileRepository(
      new ApiClient({ baseUrl: apiBaseUrl })
    );

    const profile = await repository.getBySlug("appquilar-tools");

    expect(profile).toMatchObject({
      id: "company-1",
      name: "Appquilar Tools",
      slug: "appquilar-tools",
      location: {
        city: "Alicante",
        state: "Comunitat Valenciana",
        country: "ES",
      },
      trustMetrics: {
        activeProductsCount: 12,
        totalProductsCount: 20,
        completedRentalsCount: 90,
        totalRentsCount: 110,
        averageFirstResponseMinutes30d: 24,
      },
    });
  });
});
