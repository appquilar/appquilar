import type { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import type {
    Category,
    CategoryListFilters,
    PaginatedCategoriesResult,
    CategoryUpsertPayload,
} from "@/domain/models/Category";
import { ApiClient } from "@/infrastructure/http/ApiClient";
import type { AuthSession } from "@/domain/models/AuthSession";
import { toAuthorizationHeader } from "@/domain/models/AuthSession";

type CategoryDto = {
    id?: string;
    category_id?: string;

    name: string;
    slug?: string;
    description?: string | null;

    parent_id?: string | null;

    icon_id?: string | null;
    featured_image_id?: string | null;
    landscape_image_id?: string | null;
};

type CategoryListResponseDto = {
    success?: boolean;
    data: CategoryDto[];
    total: number;
    page: number;
    per_page: number;
};

type CategoryGetResponseDto = { success?: boolean; data: CategoryDto } | CategoryDto;

const MAX_PER_PAGE = 50;

const mapCategoryDtoToDomain = (dto: CategoryDto): Category => {
    const id = dto.id ?? dto.category_id ?? "";

    return {
        id,
        name: dto.name,
        slug: dto.slug ?? "",
        description: dto.description ?? null,
        parentId: dto.parent_id ?? null,
        iconId: dto.icon_id ?? null,
        featuredImageId: dto.featured_image_id ?? null,
        landscapeImageId: dto.landscape_image_id ?? null,
    };
};

const mapDomainToUpsertDto = (payload: CategoryUpsertPayload) => ({
    category_id: payload.id,
    name: payload.name,
    slug: payload.slug,
    description: payload.description ?? null,
    parent_id: payload.parentId ?? null,
    icon_id: payload.iconId ?? null,
    featured_image_id: payload.featuredImageId ?? null,
    landscape_image_id: payload.landscapeImageId ?? null,
});

export class ApiCategoryRepository implements CategoryRepository {
    constructor(
        private readonly apiClient: ApiClient,
        private readonly getSession: () => AuthSession | null
    ) {}

    private async authHeaders(): Promise<Record<string, string>> {
        const session = this.getSession();
        const authHeader = toAuthorizationHeader(session);
        return authHeader ? { Authorization: authHeader } : {};
    }

    async getAllCategories(filters?: CategoryListFilters): Promise<PaginatedCategoriesResult> {
        const headers = await this.authHeaders();

        const params = new URLSearchParams();
        if (filters?.id) params.set("id", filters.id);
        if (filters?.name) params.set("name", filters.name);
        if (filters?.page) params.set("page", String(filters.page));

        // ✅ guardrail para evitar 400: per_page máximo 50
        if (filters?.perPage) {
            const safe = Math.max(1, Math.min(filters.perPage, MAX_PER_PAGE));
            params.set("per_page", String(safe));
        }

        const qs = params.toString();
        const path = "/api/categories" + (qs ? `?${qs}` : "");

        const response = await this.apiClient.get<CategoryListResponseDto>(path, { headers });

        return {
            categories: response.data.map(mapCategoryDtoToDomain),
            total: response.total,
            page: response.page,
            perPage: response.per_page,
        };
    }

    async getById(categoryId: string): Promise<Category> {
        const headers = await this.authHeaders();
        const response = await this.apiClient.get<CategoryGetResponseDto>(
            `/api/categories/${encodeURIComponent(categoryId)}`,
            { headers }
        );

        const dto = "data" in (response as any) ? (response as any).data : response;
        return mapCategoryDtoToDomain(dto as CategoryDto);
    }

    async create(payload: CategoryUpsertPayload): Promise<void> {
        const headers = await this.authHeaders();
        await this.apiClient.post("/api/categories", mapDomainToUpsertDto(payload), { headers });
    }

    async update(payload: CategoryUpsertPayload): Promise<void> {
        const headers = await this.authHeaders();
        await this.apiClient.patch(
            `/api/categories/${encodeURIComponent(payload.id)}`,
            mapDomainToUpsertDto(payload),
            { headers }
        );
    }
}
