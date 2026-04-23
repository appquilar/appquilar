import type { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import type {
    Category,
    CategoryBreadcrumbItem,
    CategoryListFilters,
    PaginatedCategoriesResult,
    CategoryUpsertPayload,
} from "@/domain/models/Category";
import type {
    CategoryDynamicPropertiesResult,
    DynamicPropertyDefinition,
    DynamicPropertyOption,
} from "@/domain/models/DynamicProperty";
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

    icon_name?: string | null;
    featured_image_id?: string | null;
    landscape_image_id?: string | null;
    dynamic_property_definitions?: DynamicPropertyDefinitionDto[];
};

type CategoryListResponseDto = {
    success?: boolean;
    data: CategoryDto[];
    total: number;
    page: number;
    per_page: number;
};

type CategoryGetResponseDto = { success?: boolean; data: CategoryDto } | CategoryDto;
type CategoryBreadcrumbDto = {
    id?: string;
    category_id?: string;
    parent_id?: string | null;
    name: string;
    slug?: string;
    icon_name?: string | null;
    depth?: number;
};
type CategoryBreadcrumbsResponseDto =
    | { success?: boolean; data?: CategoryBreadcrumbDto[] }
    | CategoryBreadcrumbDto[];
type DynamicPropertyOptionDto = { value: string; label: string };
type DynamicPropertyDefinitionDto = {
    code: string;
    label: string;
    type: DynamicPropertyDefinition["type"];
    filterable: boolean;
    unit?: string | null;
    options?: DynamicPropertyOptionDto[];
};
type CategoryDynamicPropertiesResponseDto = {
    success?: boolean;
    data?: {
        dynamic_filters_enabled?: boolean;
        disabled_reason?: string | null;
        definitions?: DynamicPropertyDefinitionDto[];
    };
    dynamic_filters_enabled?: boolean;
    disabled_reason?: string | null;
    definitions?: DynamicPropertyDefinitionDto[];
};

const MAX_PER_PAGE = 50;

const mapCategoryDtoToDomain = (dto: CategoryDto): Category => {
    const id = dto.id ?? dto.category_id ?? "";

    return {
        id,
        name: dto.name,
        slug: dto.slug ?? "",
        description: dto.description ?? null,
        parentId: dto.parent_id ?? null,
        iconName: dto.icon_name ?? null,
        featuredImageId: dto.featured_image_id ?? null,
        landscapeImageId: dto.landscape_image_id ?? null,
        dynamicPropertyDefinitions: Array.isArray(dto.dynamic_property_definitions)
            ? dto.dynamic_property_definitions.map(mapDynamicPropertyDefinitionDtoToDomain)
            : [],
    };
};

const mapCategoryBreadcrumbDtoToDomain = (dto: CategoryBreadcrumbDto): CategoryBreadcrumbItem => ({
    id: dto.id ?? dto.category_id ?? "",
    name: dto.name,
    slug: dto.slug ?? "",
    parentId: dto.parent_id ?? null,
    iconName: dto.icon_name ?? null,
    depth: typeof dto.depth === "number" ? dto.depth : undefined,
});

const mapDomainToUpsertDto = (payload: CategoryUpsertPayload) => ({
    category_id: payload.id,
    name: payload.name,
    slug: payload.slug,
    description: payload.description ?? null,
    parent_id: payload.parentId ?? null,
    icon_name: payload.iconName ?? null,
    featured_image_id: payload.featuredImageId ?? null,
    landscape_image_id: payload.landscapeImageId ?? null,
    dynamic_property_definitions: payload.dynamicPropertyDefinitions ?? [],
});

const mapDynamicPropertyOptionDtoToDomain = (dto: DynamicPropertyOptionDto): DynamicPropertyOption => ({
    value: dto.value,
    label: dto.label,
});

const mapDynamicPropertyDefinitionDtoToDomain = (
    dto: DynamicPropertyDefinitionDto
): DynamicPropertyDefinition => ({
    code: dto.code,
    label: dto.label,
    type: dto.type,
    filterable: Boolean(dto.filterable),
    unit: dto.unit ?? null,
    options: Array.isArray(dto.options)
        ? dto.options.map(mapDynamicPropertyOptionDtoToDomain)
        : undefined,
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
        const params = new URLSearchParams();
        if (filters?.id) params.set("id", filters.id);
        if (filters?.name) params.set("name", filters.name);
        if (filters?.page) params.set("page", String(filters.page));

        if (filters?.perPage) {
            const safe = Math.max(1, Math.min(filters.perPage, MAX_PER_PAGE));
            params.set("per_page", String(safe));
        }

        const qs = params.toString();
        const path = "/api/categories" + (qs ? `?${qs}` : "");

        const response = await this.apiClient.get<CategoryListResponseDto>(path);

        return {
            categories: response.data.map(mapCategoryDtoToDomain),
            total: response.total,
            page: response.page,
            perPage: response.per_page,
        };
    }

    async getById(categoryId: string): Promise<Category> {
        const response = await this.apiClient.get<CategoryGetResponseDto>(
            `/api/categories/${encodeURIComponent(categoryId)}`
        );

        const dto = "data" in (response as any) ? (response as any).data : response;
        return mapCategoryDtoToDomain(dto as CategoryDto);
    }

    async getBySlug(slug: string): Promise<Category> {
        const response = await this.apiClient.get<CategoryGetResponseDto>(
            `/api/categories/${encodeURIComponent(slug)}`
        );

        const dto = "data" in (response as any) ? (response as any).data : response;
        return mapCategoryDtoToDomain(dto as CategoryDto);
    }

    async getBreadcrumbs(categoryId: string): Promise<CategoryBreadcrumbItem[]> {
        const response = await this.apiClient.get<CategoryBreadcrumbsResponseDto>(
            `/api/categories/${encodeURIComponent(categoryId)}/breadcrumbs`
        );

        const items = Array.isArray(response)
            ? response
            : "data" in (response as any) && Array.isArray((response as any).data)
                ? (response as any).data
                : [];
        const mappedItems = items.map(mapCategoryBreadcrumbDtoToDomain);
        const hasDepthForEveryItem = mappedItems.every((item) => typeof item.depth === "number");

        if (!hasDepthForEveryItem) {
            return mappedItems;
        }

        return [...mappedItems].sort((left, right) => (left.depth ?? 0) - (right.depth ?? 0));
    }

    async getDynamicProperties(categoryIds: string[]): Promise<CategoryDynamicPropertiesResult> {
        const params = new URLSearchParams();
        categoryIds.forEach((categoryId) => {
            params.append("categories[]", categoryId);
        });

        const queryString = params.toString();
        const path = "/api/categories/dynamic-properties" + (queryString ? `?${queryString}` : "");
        const response = await this.apiClient.get<CategoryDynamicPropertiesResponseDto>(path);

        const payload = "data" in (response as any) && (response as any).data
            ? (response as any).data
            : response;

        return {
            dynamicFiltersEnabled: Boolean(payload.dynamic_filters_enabled),
            disabledReason: payload.disabled_reason ?? null,
            definitions: Array.isArray(payload.definitions)
                ? payload.definitions.map(mapDynamicPropertyDefinitionDtoToDomain)
                : [],
        };
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
