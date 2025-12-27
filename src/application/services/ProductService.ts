import type {
    OwnerProductsResult,
    ProductRepository,
    SearchProductsFilters,
    SearchProductsResult,
} from "@/domain/repositories/ProductRepository";
import type {ProductFormData} from "@/domain/models/Product";

export class ProductService {
    constructor(private readonly productRepository: ProductRepository) {}

    /**
     * Público (marketplace): /api/products/search
     * (si lo sigues usando en la parte pública)
     */
    async search(filters?: SearchProductsFilters): Promise<SearchProductsResult> {
        return this.productRepository.search(filters);
    }

    /**
     * Público (product page): /api/products/{slug}
     */
    async getBySlug(slug: string): Promise<ProductFormData> {
        return this.productRepository.getBySlug(slug);
    }

    /**
     * Privado (dashboard): /api/products/{product_id}
     */
    async getById(id: string): Promise<ProductFormData> {
        return this.productRepository.getById(id);
    }

    /**
     * ✅ Privado (dashboard list): /api/users/{owner_id}/products
     */
    async listByOwner(
        ownerId: string,
        page = 1,
        perPage = 10
    ): Promise<OwnerProductsResult> {
        return this.productRepository.listByOwner(ownerId, { page, perPage });
    }

    /**
     * Privado (dashboard): POST /api/products
     */
    async create(payload: ProductFormData & { id: string }): Promise<void> {
        return this.productRepository.create(payload);
    }

    /**
     * Privado (dashboard): PATCH /api/products/{product_id}
     */
    async update(productId: string, payload: ProductFormData): Promise<void> {
        return this.productRepository.update(productId, payload);
    }

    async publish(productId: string): Promise<void> {
        return this.productRepository.publish(productId);
    }

    async unpublish(productId: string): Promise<void> {
        return this.productRepository.unpublish(productId);
    }

    async archive(productId: string): Promise<void> {
        return this.productRepository.archive(productId);
    }
}
