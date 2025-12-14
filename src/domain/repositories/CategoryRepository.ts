import type {
    Category,
    CategoryListFilters,
    PaginatedCategoriesResult,
    CategoryUpsertPayload,
} from "@/domain/models/Category";

export type { CategoryListFilters, PaginatedCategoriesResult };

export interface CategoryRepository {
    getAllCategories(filters?: CategoryListFilters): Promise<PaginatedCategoriesResult>;
    getById(categoryId: string): Promise<Category>;
    getBySlug(slug: string): Promise<Category>
    create(payload: CategoryUpsertPayload): Promise<void>;
    update(payload: CategoryUpsertPayload): Promise<void>;
}
