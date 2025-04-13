
import { Product, ProductFormData } from '@/domain/models/Product';
import { IProductRepository } from '@/domain/repositories/IProductRepository';
import { RepositoryFactory } from '@/infrastructure/repositories/RepositoryFactory';

/**
 * Service for managing product data
 */
export class ProductService {
  private static instance: ProductService;
  private repository: IProductRepository;

  private constructor(repository: IProductRepository) {
    this.repository = repository;
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): ProductService {
    if (!ProductService.instance) {
      // Get repository from factory
      const repository = RepositoryFactory.getProductRepository();
      ProductService.instance = new ProductService(repository);
    }
    return ProductService.instance;
  }

  /**
   * Set a custom repository implementation
   */
  public static setRepository(repository: IProductRepository): void {
    // Update the repository in factory and service
    RepositoryFactory.setProductRepository(repository);
    
    if (ProductService.instance) {
      ProductService.instance.repository = repository;
    } else {
      ProductService.instance = new ProductService(repository);
    }
  }

  /**
   * Get all products
   */
  async getAllProducts(): Promise<Product[]> {
    return this.repository.getAllProducts();
  }

  /**
   * Get a product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    return this.repository.getProductById(id);
  }

  /**
   * Get products by company ID
   */
  async getProductsByCompanyId(companyId: string): Promise<Product[]> {
    return this.repository.getProductsByCompanyId(companyId);
  }

  /**
   * Get products by category ID
   */
  async getProductsByCategoryId(categoryId: string): Promise<Product[]> {
    return this.repository.getProductsByCategoryId(categoryId);
  }

  /**
   * Create a new product
   */
  async createProduct(productData: ProductFormData): Promise<Product> {
    return this.repository.createProduct(productData);
  }

  /**
   * Update a product
   */
  async updateProduct(id: string, productData: ProductFormData): Promise<Product> {
    return this.repository.updateProduct(id, productData);
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<boolean> {
    return this.repository.deleteProduct(id);
  }
}
