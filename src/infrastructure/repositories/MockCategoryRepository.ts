import type { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import type {
    Category,
    CategoryListFilters,
    PaginatedCategoriesResult,
    CategoryUpsertPayload,
} from "@/domain/models/Category";

export class MockCategoryRepository implements CategoryRepository {
    async getById(categoryId: string): Promise<Category> {
        throw new Error("MockCategoryRepository.getById not implemented");
    }

    async getAll(_filters?: CategoryListFilters): Promise<PaginatedCategoriesResult> {
        return { categories: [], total: 0, page: 1, perPage: 20 };
    }

    async create(_payload: CategoryUpsertPayload): Promise<Category> {
        throw new Error("MockCategoryRepository.create not implemented");
    }

    async update(_categoryId: string, _payload: Partial<CategoryUpsertPayload>): Promise<Category> {
        throw new Error("MockCategoryRepository.update not implemented");
    }
}
