
import { Category } from '@/domain/models/Category';
import { CategoryRepository } from '@/domain/repositories/CategoryRepository';
import { MOCK_CATEGORIES } from '@/components/dashboard/categories/data/mockCategories';

/**
 * Mock implementation of CategoryRepository that uses in-memory data
 */
export class MockCategoryRepository implements CategoryRepository {
  private categories: Category[] = [...MOCK_CATEGORIES];

  async getAllCategories(): Promise<Category[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.categories];
  }

  async getCategoryById(id: string): Promise<Category | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    const category = this.categories.find(c => c.id === id);
    return category ? { ...category } : null;
  }

  async getCategoriesByParentId(parentId: string | null): Promise<Category[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.categories
      .filter(c => c.parentId === parentId)
      .map(c => ({ ...c }));
  }
}
