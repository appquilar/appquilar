import { ApiClient } from "@/infrastructure/http/ApiClient";
import type { Address } from "@/domain/models/Address";
import type { AuthSession } from "@/domain/models/AuthSession";
import { toAuthorizationHeader } from "@/domain/models/AuthSession";
import type { PublicCompanyProfile } from "@/domain/models/PublicCompanyProfile";
import type { PublicCompanyProfileRepository } from "@/domain/repositories/PublicCompanyProfileRepository";

type PublicCompanyLocationDto = {
  city?: string | null;
  state?: string | null;
  country?: string | null;
  display_label?: string | null;
};

type AddressDto = {
  street?: string | null;
  street2?: string | null;
  city?: string | null;
  postal_code?: string | null;
  state?: string | null;
  country?: string | null;
};

type GeoLocationDto = {
  latitude?: number | null;
  longitude?: number | null;
};

type PublicCompanyProfileDto = {
  name: string;
  slug: string;
  description?: string | null;
  profile_picture_id?: string | null;
  header_image_id?: string | null;
  location?: PublicCompanyLocationDto;
  address?: AddressDto | null;
  geo_location?: GeoLocationDto | null;
};

type WrappedPublicCompanyResponse = {
  success?: boolean;
  data?: PublicCompanyProfileDto;
};

export class ApiPublicCompanyProfileRepository implements PublicCompanyProfileRepository {
  constructor(
    private readonly apiClient: ApiClient,
    private readonly getSession: () => AuthSession | null
  ) {}

  async getBySlug(slug: string): Promise<PublicCompanyProfile> {
    const authHeader = toAuthorizationHeader(this.getSession());
    const raw = await this.apiClient.get<PublicCompanyProfileDto | WrappedPublicCompanyResponse>(
      `/api/public/companies/${encodeURIComponent(slug)}`,
      {
        headers: authHeader ? { Authorization: authHeader } : {},
      }
    );

    const dto = this.unwrap(raw);

    return {
      name: dto.name,
      slug: dto.slug,
      description: dto.description ?? null,
      profilePictureId: dto.profile_picture_id ?? null,
      headerImageId: dto.header_image_id ?? null,
      location: {
        city: dto.location?.city ?? null,
        state: dto.location?.state ?? null,
        country: dto.location?.country ?? null,
        displayLabel: dto.location?.display_label ?? null,
      },
      address: this.mapAddress(dto.address),
      geoLocation:
        typeof dto.geo_location?.latitude === "number" &&
        typeof dto.geo_location?.longitude === "number"
          ? {
              latitude: dto.geo_location.latitude,
              longitude: dto.geo_location.longitude,
            }
          : null,
    };
  }

  private mapAddress(dto: AddressDto | null | undefined): Address | null {
    if (!dto) {
      return null;
    }

    const address: Address = {
      street: dto.street ?? null,
      street2: dto.street2 ?? null,
      city: dto.city ?? null,
      postalCode: dto.postal_code ?? null,
      state: dto.state ?? null,
      country: dto.country ?? null,
    };

    return Object.values(address).some((value) => value !== null) ? address : null;
  }

  private unwrap(
    raw: PublicCompanyProfileDto | WrappedPublicCompanyResponse
  ): PublicCompanyProfileDto {
    if (raw && typeof raw === "object" && "data" in raw && raw.data) {
      return raw.data;
    }

    return raw as PublicCompanyProfileDto;
  }
}
