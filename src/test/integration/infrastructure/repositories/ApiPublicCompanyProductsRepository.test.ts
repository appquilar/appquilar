import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";

import { server } from "@/test/mocks/server";
import { ApiClient } from "@/infrastructure/http/ApiClient";
import { ApiPublicCompanyProductsRepository } from "@/infrastructure/repositories/ApiPublicCompanyProductsRepository";

const apiBaseUrl = "http://localhost:8000";

describe("ApiPublicCompanyProductsRepository integration", () => {
  it("fetches the public company catalog by slug", async () => {
    server.use(
      http.get(`${apiBaseUrl}/api/public/companies/:slug/products`, ({ params, request }) => {
        const url = new URL(request.url);
        expect(params.slug).toBe("appquilar-tools");
        expect(request.headers.get("Authorization")).toBe("Bearer web-token");
        expect(url.searchParams.get("page")).toBe("1");
        expect(url.searchParams.get("per_page")).toBe("12");

        return HttpResponse.json({
          success: true,
          total: 1,
          page: 1,
          data: [
            {
              id: "product-1",
              internal_id: "P-001",
              name: "Taladro profesional",
              slug: "taladro-profesional",
              description: "Taladro para obra",
              publication_status: "published",
              image_ids: [],
              categories: [{ id: "cat-1", name: "Herramientas", slug: "herramientas" }],
              owner_data: {
                owner_id: "company-1",
                type: "company",
                name: "Appquilar Tools",
              },
            },
          ],
        });
      })
    );

    const repository = new ApiPublicCompanyProductsRepository(
      new ApiClient({ baseUrl: apiBaseUrl }),
      () => ({ token: "web-token" } as any)
    );

    const response = await repository.listByCompanySlug("appquilar-tools", 1, 12);

    expect(response.total).toBe(1);
    expect(response.page).toBe(1);
    expect(response.data[0]).toMatchObject({
      id: "product-1",
      slug: "taladro-profesional",
      category: {
        id: "cat-1",
        name: "Herramientas",
      },
      ownerData: {
        ownerId: "company-1",
        name: "Appquilar Tools",
      },
    });
  });
});
