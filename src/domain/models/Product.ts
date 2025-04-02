
/**
 * Product model representing rental items
 */
export interface Product {
  id: string;
  internalId: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  price: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  company: {
    id: string;
    name: string;
    slug: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  rating: number;
  reviewCount: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Form data structure for product creation/editing
 */
export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  price: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  companyId: string;
  categoryId: string;
}
