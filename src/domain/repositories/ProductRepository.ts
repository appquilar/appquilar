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
     * Get products by company ID (Legacy array return)
     */
    getProductsByCompanyId(companyId: string): Promise<Product[]>;

    /**
     * List products by owner (Legacy array return)
     */
    listByOwner(ownerId: string): Promise<Product[]>;

    /**
     * List products by owner with pagination (Dashboard usage)
     */
    listByOwnerPaginated(ownerId: string, ownerType: 'company' | 'user', page: number, perPage: number): Promise<ProductListResponse>;

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
}