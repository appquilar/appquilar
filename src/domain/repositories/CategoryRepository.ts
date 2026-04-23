import type {
    Category,
    CategoryBreadcrumbItem,
    CategoryListFilters,
    PaginatedCategoriesResult,
    CategoryUpsertPayload,
} from "@/domain/models/Category";
import type { CategoryDynamicPropertiesResult } from "@/domain/models/DynamicProperty";

export type { CategoryListFilters, PaginatedCategoriesResult };

export interface CategoryRepository {
    getAllCategories(filters?: CategoryListFilters): Promise<PaginatedCategoriesResult>;
    getById(categoryId: string): Promise<Category>;
    getBySlug(slug: string): Promise<Category>;
    getBreadcrumbs(categoryId: string): Promise<CategoryBreadcrumbItem[]>;
    getDynamicProperties(categoryIds: string[]): Promise<CategoryDynamicPropertiesResult>;
    create(payload: CategoryUpsertPayload): Promise<void>;
    update(payload: CategoryUpsertPayload): Promise<void>;
}
