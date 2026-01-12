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
     * Get all products
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
     * List products by owner (Generic)
     */
    listByOwner(ownerId: string): Promise<Product[]>;

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