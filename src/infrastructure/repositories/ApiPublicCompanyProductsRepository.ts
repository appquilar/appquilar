import type {
  Product,
  ProductInventorySummary,
  PublicationStatusType,
} from "@/domain/models/Product";
import type {
  ProductDynamicProperties,
} from "@/domain/models/DynamicProperty";
import type { ProductListResponse } from "@/domain/repositories/ProductRepository";
import type { PublicCompanyProductsRepository } from "@/domain/repositories/PublicCompanyProductsRepository";
import { ApiClient } from "@/infrastructure/http/ApiClient";
import type { AuthSession } from "@/domain/models/AuthSession";
import { toAuthorizationHeader } from "@/domain/models/AuthSession";

type PublicCompanyProductsResponse = {
  success?: boolean;
  data?: unknown;
  total?: number;
  page?: number;
};

export class ApiPublicCompanyProductsRepository implements PublicCompanyProductsRepository {
  private readonly baseUrl: string;

  constructor(
    private readonly apiClient: ApiClient,
    private readonly getSession: () => AuthSession | null
  ) {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  }

  async listByCompanySlug(slug: string, page: number, perPage: number): Promise<ProductListResponse> {
    const authHeader = toAuthorizationHeader(this.getSession());
    const response = await this.apiClient.get<PublicCompanyProductsResponse>(
      `/api/public/companies/${encodeURIComponent(slug)}/products?page=${page}&per_page=${perPage}`,
      {
        headers: authHeader ? { Authorization: authHeader } : {},
      }
    );

    const rows = Array.isArray(response.data) ? response.data : [];

    return {
      data: rows.map((row) => this.mapToDomain(row)),
      total: response.total ?? rows.length,
      page: response.page ?? page,
      availableDynamicFilters: [],
    };
  }

  private resolveInventoryMode(apiData: any): "unmanaged" | "managed_serialized" {
    const explicitMode = apiData.inventory_mode ?? apiData.inventory_summary?.inventory_mode;
    const inventoryEnabled = apiData.is_inventory_enabled ?? apiData.inventory_summary?.is_inventory_enabled ?? false;

    if (explicitMode === "managed_serialized") {
      return "managed_serialized";
    }

    if (explicitMode === "unmanaged") {
      return "unmanaged";
    }

    return inventoryEnabled ? "managed_serialized" : "unmanaged";
  }

  private mapToDomain(apiData: any): Product {
    const imageIds = Array.isArray(apiData.image_ids) ? apiData.image_ids : [];
    const primaryImageId = imageIds[0];
    const categories = Array.isArray(apiData.categories) ? apiData.categories : [];
    const primaryCategory = categories[0];

    let status: PublicationStatusType = "draft";
    if (typeof apiData.publication_status === "string") {
      status = apiData.publication_status as PublicationStatusType;
    } else if (apiData.publication_status && typeof apiData.publication_status === "object") {
      status = apiData.publication_status.status || "draft";
    } else if (typeof apiData.status === "string") {
      status = apiData.status as PublicationStatusType;
    }

    return {
      id: apiData.id || apiData.product_id,
      internalId: apiData.internal_id || "",
      name: apiData.name || "",
      slug: apiData.slug || "",
      description: apiData.description || "",
      quantity: Number(apiData.quantity ?? apiData.inventory_summary?.total_quantity ?? 1),
      isRentalEnabled: Boolean(apiData.is_rental_enabled ?? apiData.inventory_summary?.is_rental_enabled ?? true),
      isInventoryEnabled: Boolean(apiData.is_inventory_enabled ?? apiData.inventory_summary?.is_inventory_enabled ?? true),
      inventoryMode: this.resolveInventoryMode(apiData),
      bookingPolicy: apiData.booking_policy ?? "owner_managed",
      allowsQuantityRequest: Boolean(apiData.allows_quantity_request ?? true),
      imageUrl: primaryImageId ? `${this.baseUrl}/api/media/images/${primaryImageId}/MEDIUM` : "",
      thumbnailUrl: primaryImageId ? `${this.baseUrl}/api/media/images/${primaryImageId}/THUMBNAIL` : "",
      image_ids: imageIds,
      publicationStatus: status,
      dynamicProperties: this.mapDynamicProperties(apiData.dynamic_properties),
      price: {
        daily:
          Array.isArray(apiData.tiers) && apiData.tiers.length > 0
            ? (apiData.tiers[0]?.price_per_day?.amount || 0) / 100
            : 0,
        deposit: (apiData.deposit?.amount || 0) / 100,
        tiers: Array.isArray(apiData.tiers)
          ? apiData.tiers.map((tier: any) => ({
              daysFrom: tier.days_from,
              daysTo: tier.days_to,
              pricePerDay: (tier.price_per_day?.amount || 0) / 100,
            }))
          : [],
      },
      productType: "rental",
      category: {
        id: apiData.category_id || primaryCategory?.id || "",
        name: apiData.category_name || primaryCategory?.name || "",
        slug: apiData.category_slug || primaryCategory?.slug || "",
      },
      rating: apiData.rating || 0,
      reviewCount: apiData.review_count || 0,
      createdAt: apiData.created_at,
      updatedAt: apiData.updated_at,
      inventorySummary: this.mapInventorySummary(apiData.inventory_summary),
      circle: Array.isArray(apiData.circle)
        ? apiData.circle.map((point: any) => ({
            latitude: point.latitude,
            longitude: point.longitude,
          }))
        : undefined,
      ownerData: apiData.owner_data
        ? {
            ownerId: apiData.owner_data.owner_id,
            type: apiData.owner_data.type,
            name: apiData.owner_data.name,
            lastName: apiData.owner_data?.last_name,
            slug: apiData.owner_data?.slug,
            address: apiData.owner_data.address
              ? {
                  street: apiData.owner_data.address.street,
                  street2: apiData.owner_data.address.street2,
                  city: apiData.owner_data.address?.city,
                  postalCode: apiData.owner_data.address?.postal_code,
                  state: apiData.owner_data.address?.state,
                  country: apiData.owner_data.address?.country,
                }
              : undefined,
            geoLocation: apiData.owner_data.geo_location
              ? {
                  latitude: apiData.owner_data.geo_location.latitude,
                  longitude: apiData.owner_data.geo_location.longitude,
                  circle: apiData.owner_data.geo_location.circle,
                }
              : undefined,
          }
        : undefined,
    };
  }

  private mapInventorySummary(apiData: any): ProductInventorySummary | null {
    if (!apiData || typeof apiData !== "object") {
      return null;
    }

    return {
      productId: String(apiData.product_id ?? ""),
      productInternalId: String(apiData.product_internal_id ?? ""),
      totalQuantity: Number(apiData.total_quantity ?? 0),
      reservedQuantity: Number(apiData.reserved_quantity ?? 0),
      availableQuantity: Number(apiData.available_quantity ?? 0),
      isRentalEnabled: Boolean(apiData.is_rental_enabled ?? true),
      isInventoryEnabled: Boolean(apiData.is_inventory_enabled ?? false),
      capabilityState: apiData.capability?.state ?? "disabled",
      inventoryMode: this.resolveInventoryMode(apiData),
      isRentableNow: Boolean(apiData.is_rentable_now ?? false),
      unavailabilityReason: apiData.unavailability_reason ?? null,
    };
  }

  private mapDynamicProperties(apiData: any): ProductDynamicProperties | undefined {
    if (!apiData || typeof apiData !== "object" || Array.isArray(apiData)) {
      return undefined;
    }

    return apiData as ProductDynamicProperties;
  }
}
