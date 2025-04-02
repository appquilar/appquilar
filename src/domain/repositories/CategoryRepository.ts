
import { Category } from '../models/Category';

/**
 * Repository interface for accessing and managing Category data
 */
export interface CategoryRepository {
  /**
   * Get all categories
   */
  getAllCategories(): Promise<Category[]>;
  
  /**
   * Get a category by ID
   */
  getCategoryById(id: string): Promise<Category | null>;
  
  /**
   * Get categories by parent ID
   */
  getCategoriesByParentId(parentId: string | null): Promise<Category[]>;
}
