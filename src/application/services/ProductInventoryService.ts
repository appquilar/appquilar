import type { InventoryAllocation, Product, ProductInventorySummary } from "@/domain/models/Product";
import type { ProductRepository } from "@/domain/repositories/ProductRepository";

export class ProductInventoryService {
    constructor(
        private readonly productRepository: ProductRepository,
    ) {
    }

    getInventorySummary(productId: string): Promise<ProductInventorySummary | null> {
        return this.productRepository.getInventorySummary(productId);
    }

    getInventoryAllocations(productId: string): Promise<InventoryAllocation[]> {
        return this.productRepository.getInventoryAllocations(productId);
    }

    adjustInventory(productId: string, totalQuantity: number): Promise<void> {
        return this.productRepository.adjustInventory(productId, totalQuantity);
    }

    getRentability(product: Product | null) {
        const summary = product?.inventorySummary ?? null;

        return {
            summary,
            isRentableNow: summary?.isRentableNow ?? false,
            unavailabilityReason: summary?.unavailabilityReason ?? null,
            isRentalEnabled: product?.isRentalEnabled ?? false,
            availableQuantity: summary?.availableQuantity ?? 0,
        };
    }
}
