import type { ProductDynamicProperties } from "@/domain/models/DynamicProperty";

export type PublicationStatusType = 'draft' | 'published' | 'archived';
export type InventoryCapabilityState = 'enabled' | 'read_only' | 'disabled';
export type InventoryMode = 'unmanaged' | 'managed_serialized';
export type PublicBookingPolicy = 'platform_managed' | 'owner_managed';
export type InventoryUnitStatus = 'available' | 'maintenance' | 'retired';
export type ProductInventoryUnavailabilityReason = 'unpublished' | 'out_of_stock';

export interface ProductInventorySummary {
    productId: string;
    productInternalId: string;
    totalQuantity: number;
    reservedQuantity: number;
    availableQuantity: number;
    isRentalEnabled: boolean;
    isInventoryEnabled: boolean;
    capabilityState: InventoryCapabilityState;
    inventoryMode: InventoryMode;
    isRentableNow: boolean;
    unavailabilityReason: ProductInventoryUnavailabilityReason | null;
}

export interface InventoryAllocation {
    allocationId: string;
    rentId: string;
    productId: string;
    productInternalId: string;
    allocatedQuantity: number;
    assignedUnitIds?: string[];
    state: 'reserved' | 'active' | 'released';
    startsAt: string;
    endsAt: string;
    createdAt: string;
    releasedAt: string | null;
}

export interface InventoryUnit {
    unitId: string;
    productId: string;
    code: string;
    status: InventoryUnitStatus;
    sortOrder: number;
    nextAllocation?: {
        rentId: string;
        startsAt: string;
        endsAt: string;
        state: 'reserved' | 'active' | 'released';
    } | null;
}

export interface ProductPublicAvailability {
    canRequest: boolean;
    status: 'available' | 'unavailable' | 'owner_confirmation';
    message: string;
    managedByPlatform: boolean;
}

/**
 * Product model representing rental items
 */
export interface Product {
    id: string;
    internalId: string;
    name: string;
    slug: string;
    description: string;
    quantity: number;
    isRentalEnabled: boolean;
    isInventoryEnabled?: boolean;
    inventoryMode?: InventoryMode;
    bookingPolicy?: PublicBookingPolicy;
    allowsQuantityRequest?: boolean;
    imageUrl: string;
    thumbnailUrl: string;
    publicationStatus: PublicationStatusType;
    price: {
        daily?: number;
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
    inventorySummary?: ProductInventorySummary | null;
    dynamicProperties?: ProductDynamicProperties;
    // Explicitly add image_ids to the domain model for editing
    image_ids?: string[];
    circle?: { latitude: number; longitude: number }[];
    ownerData?: {
        ownerId: string;
        type: string;
        name: string;
        lastName?: string;
        slug?: string;
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
    quantity: number;
    isRentable: boolean;
    isRentalEnabled: boolean;
    isInventoryEnabled?: boolean;
    inventoryMode?: InventoryMode;
    isForSale: boolean;
    productType?: 'rental' | 'sale';
    companyId: string;
    categoryId: string;
    currentTab: string;
    images: Array<{ id: string; url?: string; file?: File }>;
    internalId?: string;
    dynamicProperties?: ProductDynamicProperties;
}
