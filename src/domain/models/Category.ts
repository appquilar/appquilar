export interface Category {
    id: string; // backend: category_id

    name: string;
    slug: string;
    description?: string | null;

    parentId?: string | null; // backend: parent_id

    // backend fields (ids de media)
    iconId?: string | null; // icon_id
    featuredImageId?: string | null; // featured_image_id
    landscapeImageId?: string | null; // landscape_image_id
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
    iconId?: string | null;
    featuredImageId?: string | null;
    landscapeImageId?: string | null;
};
