import type {
    Category,
    CategoryBreadcrumbItem,
    CategoryListFilters,
    PaginatedCategoriesResult,
    CategoryUpsertPayload,
} from "@/domain/models/Category";
import type { CategoryDynamicPropertiesResult } from "@/domain/models/DynamicProperty";
import type { CategoryRepository } from "@/domain/repositories/CategoryRepository";

export class CategoryService {
    constructor(private readonly categoryRepository: CategoryRepository) {}

    async getAllCategories(filters?: CategoryListFilters): Promise<PaginatedCategoriesResult> {
        return this.categoryRepository.getAllCategories(filters);
    }

    async getById(categoryId: string): Promise<Category> {
        return this.categoryRepository.getById(categoryId);
    }

    async getBySlug(slug: string): Promise<Category> {
        return this.categoryRepository.getBySlug(slug);
    }

    async getBreadcrumbs(categoryId: string): Promise<CategoryBreadcrumbItem[]> {
        return this.categoryRepository.getBreadcrumbs(categoryId);
    }

    async getDynamicProperties(categoryIds: string[]): Promise<CategoryDynamicPropertiesResult> {
        return this.categoryRepository.getDynamicProperties(categoryIds);
    }

    async create(payload: CategoryUpsertPayload): Promise<void> {
        return this.categoryRepository.create(payload);
    }

    async update(payload: CategoryUpsertPayload): Promise<void> {
        return this.categoryRepository.update(payload);
    }
}
