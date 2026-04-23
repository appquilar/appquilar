import { describe, expect, it, vi } from "vitest";

import { ApiPublicCompanyProfileRepository } from "@/infrastructure/repositories/ApiPublicCompanyProfileRepository";

describe("ApiPublicCompanyProfileRepository", () => {
  it("maps wrapped response into the new lightweight domain model with session auth headers when available", async () => {
    const apiClient = {
      get: vi.fn().mockResolvedValue({
        success: true,
        data: {
          name: "Alquileres Norte",
          slug: "alquileres-norte",
          description: "Especialistas en maquinaria",
          profile_picture_id: "media-1",
          header_image_id: "media-2",
          location: {
            city: "Madrid",
            state: "Madrid",
            country: "ES",
            display_label: "Madrid, Madrid, ES",
          },
          address: {
            street: "Gran Via 1",
            street2: null,
            city: "Madrid",
            postal_code: "28013",
            state: "Madrid",
            country: "ES",
          },
          geo_location: {
            latitude: 40.4168,
            longitude: -3.7038,
          },
        },
      }),
    };

    const repository = new ApiPublicCompanyProfileRepository(
      apiClient as any,
      () => ({ token: "session-token" } as any)
    );

    const profile = await repository.getBySlug("alquileres-norte");

    expect(apiClient.get).toHaveBeenCalledWith("/api/public/companies/alquileres-norte", {
      headers: { Authorization: "Bearer session-token" },
    });
    expect(profile).toEqual({
      name: "Alquileres Norte",
      slug: "alquileres-norte",
      description: "Especialistas en maquinaria",
      profilePictureId: "media-1",
      headerImageId: "media-2",
      location: {
        city: "Madrid",
        state: "Madrid",
        country: "ES",
        displayLabel: "Madrid, Madrid, ES",
      },
      address: {
        street: "Gran Via 1",
        street2: null,
        city: "Madrid",
        postalCode: "28013",
        state: "Madrid",
        country: "ES",
      },
      geoLocation: {
        latitude: 40.4168,
        longitude: -3.7038,
      },
    });
  });

  it("supports unwrapped anonymous responses and applies defaults", async () => {
    const apiClient = {
      get: vi.fn().mockResolvedValue({
        name: "Demo",
        slug: "demo",
      }),
    };

    const repository = new ApiPublicCompanyProfileRepository(apiClient as any, () => null);

    const profile = await repository.getBySlug("demo");

    expect(apiClient.get).toHaveBeenCalledWith("/api/public/companies/demo", {
      headers: {},
    });
    expect(profile.location).toEqual({
      city: null,
      state: null,
      country: null,
      displayLabel: null,
    });
    expect(profile.address).toBeNull();
    expect(profile.geoLocation).toBeNull();
  });
});
