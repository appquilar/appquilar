
/**
 * Category model representing product categories
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  iconUrl: string | null;
  headerImageUrl: string | null;
  featuredImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Form data structure for category creation/editing
 */
export interface CategoryFormData {
  name: string;
  slug: string;
  parentId: string | null;
  iconUrl: string | null;
  headerImageUrl: string | null;
  featuredImageUrl: string | null;
}
