// src/infrastructure/repositories/ApiProductRepository.ts

import type {
    OwnerProductsFilters,
    OwnerProductsResult,
    ProductRepository,
    SearchProductsFilters,
    SearchProductsResult,
} from "@/domain/repositories/ProductRepository";
import type { ProductFormData } from "@/domain/models/Product";
import type { PublicProductHit } from "@/domain/models/PublicProductHit";
import type { AuthSession } from "@/domain/models/AuthSession";
import { toAuthorizationHeader } from "@/domain/models/AuthSession";
import { ApiClient } from "@/infrastructure/http/ApiClient";

type MoneyDto = { amount: number; currency: string };

type ProductDto = {
    id: string;
    short_id?: string;

    name: string;
    slug: string;

    internal_id: string | null;
    description: string;

    company_id: string | null;
    category_id: string;

    image_ids: string[];

    publication_status?: {
        status: string;
        published_at: string | null;
    };

    deposit?: MoneyDto;
    tiers?: Array<{
        price_per_day: MoneyDto;
        days_from: number;
        days_to: number | null;
    }>;
};

type ApiSingleResponse<T> = {
    success?: boolean;
    data: T;
};

type ApiOwnerListResponse = {
    success?: boolean;
    data: {
        total: number;
        page: number;
        data: ProductDto[];
    };
};

type ApiPublicSearchResponse =
    | SearchProductsResult
    | {
    success?: boolean;
    data: {
        total: number;
        page: number;
        data: PublicProductHit[];
    };
};

function unwrapSingle<T>(raw: unknown): T {
    const r = raw as any;
    if (r && typeof r === "object" && "data" in r) return r.data as T;
    return raw as T;
}

function unwrapOwnerList(raw: unknown): { total: number; page: number; data: ProductDto[] } {
    const r = raw as any;

    if (r && typeof r === "object" && r.data && typeof r.data === "object" && Array.isArray(r.data.data)) {
        return {
            total: r.data.total ?? 0,
            page: r.data.page ?? 1,
            data: r.data.data ?? [],
        };
    }

    if (r && typeof r === "object" && Array.isArray(r.data) && typeof r.total === "number") {
        return { total: r.total ?? 0, page: r.page ?? 1, data: r.data ?? [] };
    }

    return { total: 0, page: 1, data: [] };
}

function mapProductDtoToFormData(dto: ProductDto): ProductFormData {
    const tiers = dto.tiers ?? [];
    const firstTier = tiers.find((t) => t.days_from === 1) ?? tiers[0];

    const price = {
        daily: firstTier?.price_per_day?.amount ?? 0,
        deposit: dto.deposit?.amount ?? 0,
        tiers: tiers.map((t) => ({
            daysFrom: t.days_from,
            daysTo: t.days_to ?? null,
            pricePerDay: t.price_per_day.amount,
        })),
    };

    // ✅ IMPORTANT: añadimos id (y shortId si quieres) aunque ProductFormData no lo tipa.
    // Esto arregla /dashboard/products/undefined en el listado.
    return {
        ...( {
            id: dto.id,
            shortId: dto.short_id ?? undefined,
        } as any),

        name: dto.name ?? "",
        slug: dto.slug ?? "",
        description: dto.description ?? "",

        imageUrl: "",
        thumbnailUrl: "",

        price: price as any,

        isRentable: true,
        isForSale: false,
        productType: "rental",

        companyId: dto.company_id ?? "",
        categoryId: dto.category_id ?? "",

        currentTab: "basic",

        images: dto.image_ids ?? [],

        internalId: dto.internal_id ?? "",
    } as any;
}

export class ApiProductRepository implements ProductRepository {
    constructor(
        private readonly api: ApiClient,
        private readonly getSession: () => AuthSession | null
    ) {}

    private authHeaders(): Record<string, string> {
        const session = this.getSession();
        const authHeader = toAuthorizationHeader(session);
        if (!authHeader) return {};
        return { Authorization: authHeader };
    }

    async search(filters?: SearchProductsFilters): Promise<SearchProductsResult> {
        const params = new URLSearchParams();

        if (filters?.text) params.set("text", filters.text);
        if (filters?.latitude != null) params.set("latitude", String(filters.latitude));
        if (filters?.longitude != null) params.set("longitude", String(filters.longitude));
        if (filters?.radius != null) params.set("radius", String(filters.radius));
        if (filters?.page != null) params.set("page", String(filters.page));
        if (filters?.perPage != null) params.set("per_page", String(filters.perPage));

        if (filters?.categories?.length) filters.categories.forEach((c) => params.append("categories[]", c));

        const qs = params.toString();
        const path = qs.length > 0 ? `/api/products/search?${qs}` : `/api/products/search`;

        const raw = await this.api.get<ApiPublicSearchResponse>(path);

        const r: any = raw as any;
        if (r && r.data && r.data.data && Array.isArray(r.data.data)) {
            return {
                data: r.data.data as PublicProductHit[],
                total: r.data.total ?? 0,
                page: r.data.page ?? filters?.page ?? 1,
            };
        }

        return {
            data: (r?.data ?? []) as PublicProductHit[],
            total: r?.total ?? 0,
            page: r?.page ?? filters?.page ?? 1,
        };
    }

    async listByOwner(ownerId: string, filters?: OwnerProductsFilters): Promise<OwnerProductsResult> {
        const params = new URLSearchParams();
        if (filters?.page != null) params.set("page", String(filters.page));
        if (filters?.perPage != null) params.set("per_page", String(filters.perPage));

        const qs = params.toString();
        const path =
            qs.length > 0 ? `/api/users/${ownerId}/products?${qs}` : `/api/users/${ownerId}/products`;

        const raw = await this.api.get<ApiOwnerListResponse>(path, { headers: this.authHeaders() });
        const unwrapped = unwrapOwnerList(raw);

        return {
            data: unwrapped.data.map(mapProductDtoToFormData),
            total: unwrapped.total ?? 0,
            page: unwrapped.page ?? filters?.page ?? 1,
        };
    }

    async getBySlug(slug: string): Promise<ProductFormData> {
        const raw = await this.api.get<ApiSingleResponse<ProductDto> | ProductDto>(
            `/api/products/${encodeURIComponent(slug)}`
        );
        return mapProductDtoToFormData(unwrapSingle<ProductDto>(raw));
    }

    async getById(id: string): Promise<ProductFormData> {
        const raw = await this.api.get<ApiSingleResponse<ProductDto> | ProductDto>(`/api/products/${id}`, {
            headers: this.authHeaders(),
        });
        return mapProductDtoToFormData(unwrapSingle<ProductDto>(raw));
    }

    async create(payload: ProductFormData & { id: string }): Promise<void> {
        const body = {
            id: payload.id,
            name: payload.name,
            slug: payload.slug,
            internal_id: payload.internalId ?? null,
            description: payload.description,
            company_id: payload.companyId,
            category_id: payload.categoryId,
            image_ids: payload.images ?? [],
            price: payload.price,
            is_rentable: payload.isRentable,
            is_for_sale: payload.isForSale,
            product_type: payload.productType ?? null,
        };

        await this.api.post(`/api/products`, body, {
            headers: this.authHeaders(),
            skipParseJson: true,
        });
    }

    async update(productId: string, payload: ProductFormData): Promise<void> {
        const body = {
            name: payload.name,
            slug: payload.slug,
            internal_id: payload.internalId ?? null,
            description: payload.description,
            company_id: payload.companyId,
            category_id: payload.categoryId,
            image_ids: payload.images ?? [],
            price: payload.price,
            is_rentable: payload.isRentable,
            is_for_sale: payload.isForSale,
            product_type: payload.productType ?? null,
        };

        await this.api.patch(`/api/products/${productId}`, body, {
            headers: this.authHeaders(),
            skipParseJson: true,
        });
    }

    async publish(productId: string): Promise<void> {
        await this.api.post(`/api/products/${productId}/publish`, undefined, {
            headers: this.authHeaders(),
            skipParseJson: true,
        });
    }

    async unpublish(productId: string): Promise<void> {
        await this.api.post(`/api/products/${productId}/unpublish`, undefined, {
            headers: this.authHeaders(),
            skipParseJson: true,
        });
    }

    async archive(productId: string): Promise<void> {
        await this.api.post(`/api/products/${productId}/archive`, undefined, {
            headers: this.authHeaders(),
            skipParseJson: true,
        });
    }
}
