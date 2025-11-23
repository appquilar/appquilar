
/**
 * Site model representing different websites
 */
export interface Site {
  id: string;
  name: string;
  domain: string;
  logo: string | null;
  title: string;
  description: string;
  categoryIds: string[];
  menuCategoryIds: string[];
  featuredCategoryIds: string[];
  primaryColor: string;
  heroAnimatedTexts: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Form data structure for site creation/editing
 */
export interface SiteFormData {
  name: string;
  domain: string;
  logo: string | null;
  title: string;
  description: string;
  categoryIds: string[];
  menuCategoryIds: string[];
  featuredCategoryIds: string[];
  primaryColor: string;
  heroAnimatedTexts: string[];
}
