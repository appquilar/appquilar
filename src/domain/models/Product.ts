export type PublicationStatusType = 'draft' | 'published' | 'archived';

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
    publicationStatus: PublicationStatusType;
    price: {
        deposit?: number;
        tiers?: {
            daysFrom: number;
            daysTo?: number;
            pricePerDay: number;
        }[];
    };
    productType?: 'rental' | 'sale';
    category: {
        id: string;
        name: string;
        slug: string;
    };
    rating: number;
    reviewCount: number;
    createdAt?: string;
    updatedAt?: string;
    // Explicitly add image_ids to the domain model for editing
    image_ids?: string[];
    circle?: { latitude: number; longitude: number }[];
    ownerData: {
        ownerId: string;
        type: string;
        name: string;
        lastName?: string;
        address?: {
            street: string;
            street2?: string;
            city?: string;
            postalCode?: string;
            state?: string;
            country?: string
        },
        geoLocation?: {
            latitude: number;
            longitude: number;
            circle: { latitude: number; longitude: number }[];
        }
    }
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
    publicationStatus: PublicationStatusType;
    price: {
        daily: number;
        deposit?: number;
        tiers?: {
            daysFrom: number;
            daysTo?: number;
            pricePerDay: number;
        }[];
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
    currentTab: string;
    images: any[]; // Changed to any[] to support {id, url, file} objects
    internalId?: string;
}