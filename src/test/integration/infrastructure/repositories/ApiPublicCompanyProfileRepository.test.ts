import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";

import { server } from "@/test/mocks/server";
import { ApiClient } from "@/infrastructure/http/ApiClient";
import { ApiPublicCompanyProfileRepository } from "@/infrastructure/repositories/ApiPublicCompanyProfileRepository";

const apiBaseUrl = "http://localhost:8000";

describe("ApiPublicCompanyProfileRepository integration", () => {
  it("fetches and maps public company profile from API", async () => {
    server.use(
      http.get(`${apiBaseUrl}/api/public/companies/:slug`, ({ params, request }) => {
        expect(params.slug).toBe("appquilar-tools");
        expect(request.headers.get("Authorization")).toBe("Bearer web-token");

        return HttpResponse.json({
          success: true,
          data: {
            name: "Appquilar Tools",
            slug: "appquilar-tools",
            location: {
              city: "Alicante",
              state: "Comunitat Valenciana",
              country: "ES",
              display_label: "Alicante, Comunitat Valenciana, ES",
            },
            address: {
              street: "Calle Mayor 7",
              street2: null,
              city: "Alicante",
              postal_code: "03001",
              state: "Comunitat Valenciana",
              country: "ES",
            },
            geo_location: {
              latitude: 38.3452,
              longitude: -0.481,
            },
          },
        });
      })
    );

    const repository = new ApiPublicCompanyProfileRepository(
      new ApiClient({ baseUrl: apiBaseUrl }),
      () => ({ token: "web-token" } as any)
    );

    const profile = await repository.getBySlug("appquilar-tools");

    expect(profile).toMatchObject({
      name: "Appquilar Tools",
      slug: "appquilar-tools",
      location: {
        city: "Alicante",
        state: "Comunitat Valenciana",
        country: "ES",
        displayLabel: "Alicante, Comunitat Valenciana, ES",
      },
      address: {
        street: "Calle Mayor 7",
        city: "Alicante",
        postalCode: "03001",
      },
      geoLocation: {
        latitude: 38.3452,
        longitude: -0.481,
      },
    });
  });
});
