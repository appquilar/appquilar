import { Product, ProductFormData } from '@/domain/models/Product';
import {
    ProductRepository,
    ProductSearchCriteria,
    ProductListResponse,
    ProductFilters,
    RentalCostBreakdown
} from '@/domain/repositories/ProductRepository';

/**
 * Service for managing product data
 */
export class ProductService {
    constructor(private repository: ProductRepository) {}

    async search(criteria: ProductSearchCriteria): Promise<ProductListResponse> {
        return this.repository.search(criteria);
    }

    async getAllProducts(): Promise<Product[]> {
        return this.repository.getAllProducts();
    }

    async getProductById(id: string): Promise<Product | null> {
        return this.repository.getProductById(id);
    }

    async getBySlug(slug: string): Promise<Product | null> {
        return this.repository.getBySlug(slug);
    }

    async getProductsByCompanyId(companyId: string): Promise<Product[]> {
        return this.repository.getProductsByCompanyId(companyId);
    }

    async listByOwner(ownerId: string): Promise<Product[]> {
        return this.repository.listByOwner(ownerId);
    }

    async listByOwnerPaginated(
        ownerId: string,
        ownerType: 'company' | 'user',
        page: number,
        perPage: number,
        filters?: ProductFilters
    ): Promise<ProductListResponse> {
        return this.repository.listByOwnerPaginated(ownerId, ownerType, page, perPage, filters);
    }

    async getProductsByCategoryId(categoryId: string): Promise<Product[]> {
        return this.repository.getProductsByCategoryId(categoryId);
    }

    async createProduct(productData: ProductFormData): Promise<Product> {
        return this.repository.createProduct(productData);
    }

    async updateProduct(id: string, productData: ProductFormData): Promise<Product> {
        return this.repository.updateProduct(id, productData);
    }

    async deleteProduct(id: string): Promise<boolean> {
        return this.repository.deleteProduct(id);
    }

    async publishProduct(id: string): Promise<boolean> {
        return this.repository.publishProduct(id);
    }

    async calculateRentalCost(id: string, startDate: string, endDate: string): Promise<RentalCostBreakdown> {
        return this.repository.calculateRentalCost(id, startDate, endDate);
    }
}
