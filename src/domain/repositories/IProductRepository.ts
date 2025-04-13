
import { Product, ProductFormData } from '../models/Product';

/**
 * Repository interface for accessing and managing Product data
 */
export interface IProductRepository {
  /**
   * Get all products
   */
  getAllProducts(): Promise<Product[]>;
  
  /**
   * Get a product by ID
   */
  getProductById(id: string): Promise<Product | null>;
  
  /**
   * Get products by company ID
   */
  getProductsByCompanyId(companyId: string): Promise<Product[]>;
  
  /**
   * Get products by category ID
   */
  getProductsByCategoryId(categoryId: string): Promise<Product[]>;
  
  /**
   * Create a new product
   */
  createProduct(productData: ProductFormData): Promise<Product>;
  
  /**
   * Update a product
   */
  updateProduct(id: string, productData: ProductFormData): Promise<Product>;
  
  /**
   * Delete a product
   */
  deleteProduct(id: string): Promise<boolean>;
}
