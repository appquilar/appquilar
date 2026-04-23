import type { DynamicPropertyDefinition } from "@/domain/models/DynamicProperty";

export interface Category {
    id: string; // backend: category_id

    name: string;
    slug: string;
    description?: string | null;

    parentId?: string | null; // backend: parent_id

    // backend fields
    iconName?: string | null; // icon_name
    featuredImageId?: string | null; // featured_image_id
    landscapeImageId?: string | null; // landscape_image_id
    dynamicPropertyDefinitions?: DynamicPropertyDefinition[];
}

export interface CategoryBreadcrumbItem {
    id: string;
    name: string;
    slug: string;
    parentId?: string | null;
    iconName?: string | null;
    depth?: number;
}

export interface CategoryListFilters {
    id?: string;
    name?: string;
    page?: number;
    perPage?: number;
}

export interface PaginatedCategoriesResult {
    categories: Category[];
    total: number;
    page: number;
    perPage: number;
}

export type CategoryUpsertPayload = {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    parentId?: string | null;
    iconName?: string | null;
    featuredImageId?: string | null;
    landscapeImageId?: string | null;
    dynamicPropertyDefinitions?: DynamicPropertyDefinition[];
};
