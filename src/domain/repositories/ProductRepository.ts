import { Product, ProductFormData } from '../models/Product';

export interface ProductSearchCriteria {
    text?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    categories?: string[];
    page?: number;
    per_page?: number;
}

export interface ProductListResponse {
    data: Product[];
    total: number;
    page: number;
}

export interface RentalCostBreakdown {
    productId: string;
    startDate: string;
    endDate: string;
    days: number;
    pricePerDay: {
        amount: number;
        currency: string;
    };
    rentalPrice: {
        amount: number;
        currency: string;
    };
    deposit: {
        amount: number;
        currency: string;
    };
    totalPrice: {
        amount: number;
        currency: string;
    };
}

export interface ProductFilters {
    name?: string;
    id?: string;
    internalId?: string;
    categoryId?: string;
    publicationStatus?: 'draft' | 'published' | 'archived';
}

/**
 * Repository interface for accessing and managing Product data
 */
export interface ProductRepository {
    /**
     * Search products with filters
     */
    search(criteria: ProductSearchCriteria): Promise<ProductListResponse>;

    /**
     * Get all products (legacy/simple list)
     */
    getAllProducts(): Promise<Product[]>;

    /**
     * Get a product by ID (Legacy alias)
     */
    getProductById(id: string): Promise<Product | null>;

    /**
     * Get a product by ID
     */
    getById(id: string): Promise<Product | null>;

    /**
     * Get a product by Slug
     */
    getBySlug(slug: string): Promise<Product | null>;

    /**
     * Get products by company ID
     */
    getProductsByCompanyId(companyId: string): Promise<Product[]>;

    /**
     * List products by owner (Legacy array return)
     */
    listByOwner(ownerId: string): Promise<Product[]>;

    /**
     * List products by owner with pagination and filters
     */
    listByOwnerPaginated(
        ownerId: string,
        ownerType: 'company' | 'user',
        page: number,
        perPage: number,
        filters?: ProductFilters
    ): Promise<ProductListResponse>;

    /**
     * Get products by category ID
     */
    getProductsByCategoryId(categoryId: string): Promise<Product[]>;

    /**
     * Create a new product
     */
    createProduct(productData: ProductFormData): Promise<Product>;

    /**
     * Update an existing product
     */
    updateProduct(id: string, productData: ProductFormData): Promise<Product>;

    /**
     * Delete a product
     */
    deleteProduct(id: string): Promise<boolean>;

    /**
     * Publish a product
     */
    publishProduct(id: string): Promise<boolean>;

    /**
     * Calculate rental cost for a product in a date range
     */
    calculateRentalCost(id: string, startDate: string, endDate: string): Promise<RentalCostBreakdown>;
}
