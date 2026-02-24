import { describe, expect, it, vi } from "vitest";
import { ApiPublicCompanyProfileRepository } from "@/infrastructure/repositories/ApiPublicCompanyProfileRepository";

describe("ApiPublicCompanyProfileRepository", () => {
  it("maps wrapped response into domain model", async () => {
    const apiClient = {
      get: vi.fn().mockResolvedValue({
        success: true,
        data: {
          company_id: "company-1",
          name: "Alquileres Norte",
          slug: "alquileres-norte",
          description: "Especialistas en maquinaria",
          profile_picture_id: "media-1",
          location: {
            city: "Madrid",
            state: "Madrid",
            country: "ES",
          },
          trust_metrics: {
            active_products_count: 8,
            total_products_count: 10,
            completed_rentals_count: 120,
            total_rents_count: 145,
            average_first_response_minutes_30d: 18,
            response_rate_24h_30d: 97,
            views_30d: 230,
            unique_visitors_30d: 140,
            logged_views_30d: 120,
            anonymous_views_30d: 110,
          },
        },
      }),
    };

    const repository = new ApiPublicCompanyProfileRepository(apiClient as any);

    const profile = await repository.getBySlug("alquileres-norte");

    expect(apiClient.get).toHaveBeenCalledWith("/api/public/companies/alquileres-norte");
    expect(profile).toEqual({
      id: "company-1",
      name: "Alquileres Norte",
      slug: "alquileres-norte",
      description: "Especialistas en maquinaria",
      profilePictureId: "media-1",
      location: {
        city: "Madrid",
        state: "Madrid",
        country: "ES",
      },
      trustMetrics: {
        activeProductsCount: 8,
        totalProductsCount: 10,
        completedRentalsCount: 120,
        totalRentsCount: 145,
        averageFirstResponseMinutes30d: 18,
        responseRate24h30d: 97,
        views30d: 230,
        uniqueVisitors30d: 140,
        loggedViews30d: 120,
        anonymousViews30d: 110,
      },
    });
  });

  it("supports unwrapped responses and applies defaults", async () => {
    const apiClient = {
      get: vi.fn().mockResolvedValue({
        company_id: "company-2",
        name: "Demo",
        slug: "demo",
      }),
    };

    const repository = new ApiPublicCompanyProfileRepository(apiClient as any);

    const profile = await repository.getBySlug("demo");

    expect(profile.location).toEqual({ city: null, state: null, country: null });
    expect(profile.trustMetrics).toEqual({
      activeProductsCount: 0,
      totalProductsCount: 0,
      completedRentalsCount: 0,
      totalRentsCount: 0,
      averageFirstResponseMinutes30d: null,
      responseRate24h30d: 0,
      views30d: 0,
      uniqueVisitors30d: 0,
      loggedViews30d: 0,
      anonymousViews30d: 0,
    });
  });
});
