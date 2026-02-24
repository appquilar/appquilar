import { ApiClient } from "@/infrastructure/http/ApiClient";
import type { PublicCompanyProfile } from "@/domain/models/PublicCompanyProfile";
import type { PublicCompanyProfileRepository } from "@/domain/repositories/PublicCompanyProfileRepository";

type PublicCompanyLocationDto = {
  city?: string | null;
  state?: string | null;
  country?: string | null;
};

type PublicCompanyTrustMetricsDto = {
  active_products_count?: number;
  total_products_count?: number;
  completed_rentals_count?: number;
  total_rents_count?: number;
  average_first_response_minutes_30d?: number | null;
  response_rate_24h_30d?: number;
  views_30d?: number;
  unique_visitors_30d?: number;
  logged_views_30d?: number;
  anonymous_views_30d?: number;
};

type PublicCompanyProfileDto = {
  company_id: string;
  name: string;
  slug: string;
  description?: string | null;
  profile_picture_id?: string | null;
  location?: PublicCompanyLocationDto;
  trust_metrics?: PublicCompanyTrustMetricsDto;
};

type WrappedPublicCompanyResponse = {
  success?: boolean;
  data?: PublicCompanyProfileDto;
};

export class ApiPublicCompanyProfileRepository implements PublicCompanyProfileRepository {
  constructor(private readonly apiClient: ApiClient) {}

  async getBySlug(slug: string): Promise<PublicCompanyProfile> {
    const raw = await this.apiClient.get<PublicCompanyProfileDto | WrappedPublicCompanyResponse>(
      `/api/public/companies/${encodeURIComponent(slug)}`
    );

    const dto = this.unwrap(raw);
    const trust = dto.trust_metrics ?? {};

    return {
      id: dto.company_id,
      name: dto.name,
      slug: dto.slug,
      description: dto.description ?? null,
      profilePictureId: dto.profile_picture_id ?? null,
      location: {
        city: dto.location?.city ?? null,
        state: dto.location?.state ?? null,
        country: dto.location?.country ?? null,
      },
      trustMetrics: {
        activeProductsCount: trust.active_products_count ?? 0,
        totalProductsCount: trust.total_products_count ?? 0,
        completedRentalsCount: trust.completed_rentals_count ?? 0,
        totalRentsCount: trust.total_rents_count ?? 0,
        averageFirstResponseMinutes30d: trust.average_first_response_minutes_30d ?? null,
        responseRate24h30d: trust.response_rate_24h_30d ?? 0,
        views30d: trust.views_30d ?? 0,
        uniqueVisitors30d: trust.unique_visitors_30d ?? 0,
        loggedViews30d: trust.logged_views_30d ?? 0,
        anonymousViews30d: trust.anonymous_views_30d ?? 0,
      },
    };
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
