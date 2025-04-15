
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
  availability?: AvailabilityPeriod[];
  isAlwaysAvailable?: boolean;
  unavailableDates?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Period of availability for a rental product
 */
export interface AvailabilityPeriod {
  id: string;
  startDate: string;
  endDate: string;
  status: 'available' | 'unavailable';
  includeWeekends: boolean;
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
  availability?: AvailabilityPeriod[];
  isAlwaysAvailable?: boolean;
  unavailableDates?: string[];
}
