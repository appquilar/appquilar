import type { SiteRepository } from "@/domain/repositories/SiteRepository";
import type { Site } from "@/domain/models/Site";
import type { AuthSession } from "@/domain/models/AuthSession";
import { toAuthorizationHeader } from "@/domain/models/AuthSession";
import { ApiClient } from "@/infrastructure/http/ApiClient";

type SiteDto = {
    site_id?: string;
    id?: string;

    name: string;
    title: string;
    url: string;

    description?: string | null;

    logo_id?: string | null;
    favicon_id?: string | null;

    primary_color?: string;

    category_ids?: string[];
    menu_category_ids?: string[];
    featured_category_ids?: string[];
};

type SiteGetResponseDto =
    | { success?: boolean; data: SiteDto }
    | SiteDto;

const mapDtoToDomain = (dto: SiteDto): Site => {
    const id = dto.site_id ?? dto.id ?? "";

    return {
        id,
        name: dto.name,
        title: dto.title,
        url: dto.url,
        description: dto.description ?? null,

        logoId: dto.logo_id ?? null,
        faviconId: dto.favicon_id ?? null,

        primaryColor: dto.primary_color ?? "#4F46E5",

        categoryIds: dto.category_ids ?? [],
        menuCategoryIds: dto.menu_category_ids ?? [],
        featuredCategoryIds: dto.featured_category_ids ?? [],
    };
};

const mapDomainToDto = (site: Site) => ({
    site_id: site.id,
    name: site.name,
    title: site.title,
    url: site.url,
    description: site.description ?? null,

    logo_id: site.logoId ?? null,
    favicon_id: site.faviconId ?? null,

    primary_color: site.primaryColor,

    category_ids: site.categoryIds,
    menu_category_ids: site.menuCategoryIds,
    featured_category_ids: site.featuredCategoryIds,
});

export class ApiSiteRepository implements SiteRepository {
    constructor(
        private readonly apiClient: ApiClient,
        private readonly getSession: () => AuthSession | null
    ) {}

    private async authHeaders(): Promise<Record<string, string>> {
        const session = this.getSession();
        const authHeader = toAuthorizationHeader(session);
        return authHeader ? { Authorization: authHeader } : {};
    }

    async getById(siteId: string): Promise<Site> {
        const headers = await this.authHeaders();

        const response = await this.apiClient.get<SiteGetResponseDto>(
            `/api/sites/${encodeURIComponent(siteId)}`,
            { headers }
        );

        const dto = "data" in (response as any) ? (response as any).data : response;
        return mapDtoToDomain(dto as SiteDto);
    }

    async update(site: Site): Promise<void> {
        const headers = await this.authHeaders();

        await this.apiClient.patch(
            `/api/sites/${encodeURIComponent(site.id)}`,
            mapDomainToDto(site),
            { headers }
        );
    }
}
