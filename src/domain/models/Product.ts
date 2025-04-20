
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
    weekly?: number;
    monthly?: number;
    hourly?: number;
    deposit?: number;
  };
  secondHand?: {
    price: number;
    negotiable: boolean;
    additionalInfo?: string;
  };
  isRentable: boolean;
  isForSale: boolean;
  productType?: 'rental' | 'sale';
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
    weekly?: number;
    monthly?: number;
    hourly?: number;
    deposit?: number;
  };
  secondHand?: {
    price: number;
    negotiable: boolean;
    additionalInfo?: string;
  };
  isRentable: boolean;
  isForSale: boolean;
  productType?: 'rental' | 'sale';
  companyId: string;
  categoryId: string;
  // Field to track current tab in mobile view
  currentTab: string;
  // Add images field to the schema
  images: any[];
}
