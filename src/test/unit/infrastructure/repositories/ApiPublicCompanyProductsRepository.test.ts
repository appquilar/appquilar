import { describe, expect, it, vi } from "vitest";

import { ApiPublicCompanyProductsRepository } from "@/infrastructure/repositories/ApiPublicCompanyProductsRepository";

describe("ApiPublicCompanyProductsRepository", () => {
  it("maps wrapped product collections by company slug with session auth headers when available", async () => {
    const apiClient = {
      get: vi.fn().mockResolvedValue({
        success: true,
        total: 1,
        page: 2,
        data: [
          {
            id: "product-1",
            internal_id: "P-001",
            name: "Taladro profesional",
            slug: "taladro-profesional",
            description: "Taladro para obra",
            publication_status: "published",
            image_ids: ["img-1"],
            categories: [{ id: "cat-1", name: "Herramientas", slug: "herramientas" }],
            tiers: [
              {
                days_from: 1,
                days_to: 3,
                price_per_day: {
                  amount: 14900,
                  currency: "EUR",
                },
              },
            ],
            deposit: {
              amount: 50000,
              currency: "EUR",
            },
            owner_data: {
              owner_id: "company-1",
              type: "company",
              name: "Alquileres Norte",
            },
          },
        ],
      }),
    };

    const repository = new ApiPublicCompanyProductsRepository(
      apiClient as any,
      () => ({ token: "session-token" } as any)
    );

    const response = await repository.listByCompanySlug("alquileres-norte", 2, 12);

    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/public/companies/alquileres-norte/products?page=2&per_page=12",
      {
        headers: { Authorization: "Bearer session-token" },
      }
    );
    expect(response.total).toBe(1);
    expect(response.page).toBe(2);
    expect(response.data[0]).toMatchObject({
      id: "product-1",
      name: "Taladro profesional",
      slug: "taladro-profesional",
      price: {
        daily: 149,
        deposit: 500,
      },
      ownerData: {
        ownerId: "company-1",
        name: "Alquileres Norte",
      },
    });
  });

  it("falls back to empty auth headers and maps nested inventory, owner and status objects", async () => {
    const apiClient = {
      get: vi.fn().mockResolvedValue({
        success: true,
        total: 1,
        data: [
          {
            product_id: "product-2",
            internal_id: "P-002",
            name: "Foco LED",
            slug: "foco-led",
            description: "Foco con trípode",
            publication_status: {
              status: "archived",
            },
            is_inventory_enabled: true,
            inventory_summary: {
              product_id: "product-2",
              product_internal_id: "P-002",
              total_quantity: 3,
              reserved_quantity: 1,
              available_quantity: 2,
              is_inventory_enabled: true,
              is_rental_enabled: true,
              capability: {
                state: "read_only",
              },
              is_rentable_now: true,
              unavailability_reason: null,
            },
            dynamic_properties: ["should-be-ignored"],
            owner_data: {
              owner_id: "company-2",
              type: "company",
              name: "Luces Norte",
              last_name: "Ops",
              slug: "luces-norte",
              geo_location: {
                latitude: 41.3,
                longitude: 2.1,
                circle: [{ latitude: 41.3, longitude: 2.1 }],
              },
            },
          },
        ],
      }),
    };

    const repository = new ApiPublicCompanyProductsRepository(apiClient as any, () => null);

    const response = await repository.listByCompanySlug("luces-norte", 1, 6);

    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/public/companies/luces-norte/products?page=1&per_page=6",
      {
        headers: {},
      }
    );
    expect(response.data[0]).toMatchObject({
      id: "product-2",
      publicationStatus: "archived",
      inventoryMode: "managed_serialized",
      dynamicProperties: undefined,
      inventorySummary: {
        capabilityState: "read_only",
        availableQuantity: 2,
      },
      ownerData: {
        ownerId: "company-2",
        lastName: "Ops",
        geoLocation: {
          latitude: 41.3,
          circle: [{ latitude: 41.3, longitude: 2.1 }],
        },
      },
    });
  });

  it("returns an empty list when the backend does not send an array payload", async () => {
    const apiClient = {
      get: vi.fn().mockResolvedValue({
        success: true,
        data: {
          items: [],
        },
      }),
    };

    const repository = new ApiPublicCompanyProductsRepository(apiClient as any, () => null);

    await expect(repository.listByCompanySlug("empty", 3, 4)).resolves.toEqual({
      data: [],
      total: 0,
      page: 3,
      availableDynamicFilters: [],
    });
  });

  it("maps explicit inventory modes, fallback status fields and structured dynamic properties", async () => {
    const apiClient = {
      get: vi.fn().mockResolvedValue({
        success: true,
        total: 1,
        data: [
          {
            product_id: "product-3",
            status: "published",
            inventory_mode: "unmanaged",
            quantity: "7",
            is_inventory_enabled: false,
            is_rental_enabled: false,
            booking_policy: "instant",
            allows_quantity_request: false,
            dynamic_properties: {
              battery_hours: 8,
            },
            category_id: "cat-9",
            category_name: "Generadores",
            category_slug: "generadores",
            circle: [
              {
                latitude: 40.4,
                longitude: -3.7,
              },
            ],
            owner_data: {
              owner_id: "company-9",
              type: "company",
              name: "Energía Norte",
              address: {
                street: "Calle Mayor 1",
                street2: "Nave 2",
                city: "Madrid",
                postal_code: "28001",
                state: "Madrid",
                country: "España",
              },
            },
          },
        ],
      }),
    };

    const repository = new ApiPublicCompanyProductsRepository(
      apiClient as any,
      () => ({ token: "" } as any)
    );

    const response = await repository.listByCompanySlug("energia-norte", 1, 5);

    expect(response.data[0]).toMatchObject({
      id: "product-3",
      publicationStatus: "published",
      inventoryMode: "unmanaged",
      quantity: 7,
      isInventoryEnabled: false,
      isRentalEnabled: false,
      bookingPolicy: "instant",
      allowsQuantityRequest: false,
      dynamicProperties: {
        battery_hours: 8,
      },
      category: {
        id: "cat-9",
        name: "Generadores",
        slug: "generadores",
      },
      circle: [
        {
          latitude: 40.4,
          longitude: -3.7,
        },
      ],
      ownerData: {
        address: {
          street: "Calle Mayor 1",
          street2: "Nave 2",
          city: "Madrid",
          postalCode: "28001",
          state: "Madrid",
          country: "España",
        },
      },
    });
  });
});
