import type {
    InventoryCapabilityState,
    Product,
    ProductInventoryUnavailabilityReason,
} from "@/domain/models/Product";

export interface ProductRentabilityView {
    inventoryManaged: boolean;
    isRentableNow: boolean;
    availableQuantity: number;
    unavailabilityReason: ProductInventoryUnavailabilityReason | null;
    availabilityLabel: string;
    availabilityMessage: string;
    availabilityTone: "success" | "warning" | "muted";
}

const isManagedInventoryCapability = (capabilityState: InventoryCapabilityState | undefined) =>
    capabilityState === "enabled" || capabilityState === "read_only";

const isInventoryEnabledForProduct = (product: Product | null) =>
    product?.inventorySummary?.isInventoryEnabled
    ?? product?.isInventoryEnabled
    ?? true;

const getAvailabilityLabel = (
    reason: ProductInventoryUnavailabilityReason | null,
    isRentableNow: boolean,
) => {
    if (isRentableNow) {
        return "Disponible";
    }

    switch (reason) {
        case "out_of_stock":
            return "Sin stock";
        case "unpublished":
            return "No publicado";
        default:
            return "No disponible";
    }
};

const getAvailabilityMessage = (
    reason: ProductInventoryUnavailabilityReason | null,
    isRentableNow: boolean,
    inventoryManaged: boolean,
) => {
    if (isRentableNow) {
        return inventoryManaged
            ? "El producto está visible y con capacidad disponible para nuevas reservas."
            : "El producto está visible y se alquila en modo estándar, sin cupos de inventario.";
    }

    switch (reason) {
        case "out_of_stock":
            return "Ahora mismo no quedan huecos libres para nuevas reservas.";
        case "unpublished":
            return "El producto no está publicado y por eso no se puede alquilar.";
        default:
            return "El producto no está disponible para nuevas reservas en este momento.";
    }
};

const getAvailabilityTone = (
    reason: ProductInventoryUnavailabilityReason | null,
    isRentableNow: boolean,
) => {
    if (isRentableNow) {
        return "success" as const;
    }

    switch (reason) {
        case "out_of_stock":
            return "warning" as const;
        case "unpublished":
            return "muted" as const;
        default:
            return "muted" as const;
    }
};

export const resolveProductRentability = (product: Product | null): ProductRentabilityView => {
    const inventorySummary = product?.inventorySummary ?? null;
    const inventoryManaged = isManagedInventoryCapability(inventorySummary?.capabilityState)
        && isInventoryEnabledForProduct(product);
    const availableQuantity = inventoryManaged
        ? Math.max(0, inventorySummary?.availableQuantity ?? 0)
        : Math.max(1, product?.quantity ?? 1);
    const unavailabilityReason = inventorySummary?.unavailabilityReason
        ?? (
            product?.publicationStatus !== "published"
                ? "unpublished"
                : inventoryManaged && availableQuantity <= 0
                    ? "out_of_stock"
                    : null
        );
    const isRentableNow = inventorySummary?.isRentableNow
        ?? Boolean(product && product.publicationStatus === "published" && (!inventoryManaged || availableQuantity > 0));

    return {
        inventoryManaged,
        isRentableNow,
        availableQuantity,
        unavailabilityReason,
        availabilityLabel: getAvailabilityLabel(unavailabilityReason, isRentableNow),
        availabilityMessage: getAvailabilityMessage(unavailabilityReason, isRentableNow, inventoryManaged),
        availabilityTone: getAvailabilityTone(unavailabilityReason, isRentableNow),
    };
};

export const formatProductAvailabilityLabel = (
    product: Product | null,
    options: { includeQuantity?: boolean } = {},
) => {
    const rentability = resolveProductRentability(product);

    if (rentability.isRentableNow && options.includeQuantity && rentability.inventoryManaged) {
        return `Disponible (${rentability.availableQuantity})`;
    }

    return rentability.availabilityLabel;
};
