import type { PublicProductHit } from "@/domain/models/PublicProductHit";
import type { ProductFormData } from "@/domain/models/Product";

export type SearchProductsFilters = {
    text?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    categories?: string[];
    page?: number;
    perPage?: number;
};

export type SearchProductsResult = {
    data: PublicProductHit[];
    total: number;
    page: number;
};

export type OwnerProductsFilters = {
    page?: number;
    perPage?: number;
};

export type OwnerProductsResult = {
    data: ProductFormData[]; // dashboard lista “form-like”
    total: number;
    page: number;
};

export interface ProductRepository {
    /**
     * PÚBLICO: sólo published. Devuelve hits (no ProductResponse completo).
     */
    search(filters?: SearchProductsFilters): Promise<SearchProductsResult>;

    /**
     * DASHBOARD: productos por owner (user). Devuelve ProductFormData[] para pintar y editar.
     */
    listByOwner(ownerId: string, filters?: OwnerProductsFilters): Promise<OwnerProductsResult>;

    /**
     * Público por slug (detalle). Lo devolvemos como ProductFormData para reutilizar el form.
     */
    getBySlug(slug: string): Promise<ProductFormData>;

    /**
     * Privado por id (dashboard).
     */
    getById(id: string): Promise<ProductFormData>;

    /**
     * CRUD (según Nelmio: 201/204 sin body).
     */
    create(payload: ProductFormData & { id: string }): Promise<void>;
    update(productId: string, payload: ProductFormData): Promise<void>;

    publish(productId: string): Promise<void>;
    unpublish(productId: string): Promise<void>;
    archive(productId: string): Promise<void>;
}
