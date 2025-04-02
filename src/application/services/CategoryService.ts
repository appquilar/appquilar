
import { Category } from '@/domain/models/Category';
import { CategoryRepository } from '@/domain/repositories/CategoryRepository';
import { MockCategoryRepository } from '@/infrastructure/repositories/MockCategoryRepository';

/**
 * Service for managing category data
 */
export class CategoryService {
  private static instance: CategoryService;
  private repository: CategoryRepository;

  private constructor(repository: CategoryRepository) {
    this.repository = repository;
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): CategoryService {
    if (!CategoryService.instance) {
      // Using the mock repository for now
      const repository = new MockCategoryRepository();
      CategoryService.instance = new CategoryService(repository);
    }
    return CategoryService.instance;
  }

  /**
   * Set a custom repository implementation
   */
  public static setRepository(repository: CategoryRepository): void {
    if (CategoryService.instance) {
      CategoryService.instance.repository = repository;
    } else {
      CategoryService.instance = new CategoryService(repository);
    }
  }

  /**
   * Get all categories
   */
  async getAllCategories(): Promise<Category[]> {
    return this.repository.getAllCategories();
  }

  /**
   * Get a category by ID
   */
  async getCategoryById(id: string): Promise<Category | null> {
    return this.repository.getCategoryById(id);
  }

  /**
   * Get categories by parent ID
   */
  async getCategoriesByParentId(parentId: string | null): Promise<Category[]> {
    return this.repository.getCategoriesByParentId(parentId);
  }
}
