import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productInventoryService } from "@/compositionRoot";
import type {
    Product,
    ProductInventoryUnavailabilityReason,
} from "@/domain/models/Product";

export const useProductInventory = (productId?: string | null, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["productInventory", productId],
        queryFn: async () => {
            if (!productId) {
                return null;
            }

            return productInventoryService.getInventorySummary(productId);
        },
        enabled: enabled && Boolean(productId),
    });
};

export const useProductInventoryAllocations = (productId?: string | null, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["productInventory", productId, "allocations"],
        queryFn: async () => {
            if (!productId) {
                return [];
            }

            return productInventoryService.getInventoryAllocations(productId);
        },
        enabled: enabled && Boolean(productId),
    });
};

export const useAdjustProductInventory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ productId, totalQuantity }: { productId: string; totalQuantity: number }) =>
            productInventoryService.adjustInventory(productId, totalQuantity),
        onSuccess: async (_data, variables) => {
            await queryClient.invalidateQueries({ queryKey: ["productInventory", variables.productId] });
            await queryClient.invalidateQueries({ queryKey: ["productInventory", variables.productId, "allocations"] });
            await queryClient.invalidateQueries({ queryKey: ["product", variables.productId] });
            await queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
};

const getAvailabilityLabel = (reason: ProductInventoryUnavailabilityReason | null, isRentableNow: boolean) => {
    if (isRentableNow) {
        return "Disponible";
    }

    switch (reason) {
        case "rental_paused":
            return "Alquiler pausado";
        case "out_of_stock":
            return "Sin stock";
        case "unpublished":
            return "No publicado";
        default:
            return "No disponible";
    }
};

const getAvailabilityMessage = (reason: ProductInventoryUnavailabilityReason | null, isRentableNow: boolean) => {
    if (isRentableNow) {
        return "El producto está visible y con capacidad disponible para nuevas reservas.";
    }

    switch (reason) {
        case "rental_paused":
            return "El producto sigue visible, pero el alquiler está pausado manualmente.";
        case "out_of_stock":
            return "Ahora mismo no quedan huecos libres para nuevas reservas.";
        case "unpublished":
            return "El producto no está publicado y por eso no se puede alquilar.";
        default:
            return "El producto no está disponible para nuevas reservas en este momento.";
    }
};

const getAvailabilityTone = (reason: ProductInventoryUnavailabilityReason | null, isRentableNow: boolean) => {
    if (isRentableNow) {
        return "success" as const;
    }

    switch (reason) {
        case "rental_paused":
        case "out_of_stock":
            return "warning" as const;
        case "unpublished":
            return "muted" as const;
        default:
            return "muted" as const;
    }
};

export const useProductRentability = (product: Product | null) => {
    const inventorySummary = product?.inventorySummary ?? null;
    const availableQuantity = inventorySummary?.availableQuantity ?? Math.max(0, product?.quantity ?? 0);
    const unavailabilityReason = inventorySummary?.unavailabilityReason
        ?? (
            product?.publicationStatus !== "published"
                ? "unpublished"
                : !product?.isRentalEnabled
                    ? "rental_paused"
                    : availableQuantity <= 0
                        ? "out_of_stock"
                        : null
        );
    const isRentableNow = inventorySummary?.isRentableNow
        ?? Boolean(
            product
            && product.publicationStatus === "published"
            && product.isRentalEnabled
            && availableQuantity > 0
        );

    return {
        isRentableNow,
        availableQuantity,
        unavailabilityReason,
        isRentalEnabled: product?.isRentalEnabled ?? false,
        availabilityLabel: getAvailabilityLabel(unavailabilityReason, isRentableNow),
        availabilityMessage: getAvailabilityMessage(unavailabilityReason, isRentableNow),
        availabilityTone: getAvailabilityTone(unavailabilityReason, isRentableNow),
    };
};
