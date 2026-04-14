import type { User } from "@/domain/models/User";
import type {
    FeatureCapabilities,
    InventoryManagementCapability,
} from "@/domain/models/Subscription";

export class CapabilityService {
    getCapabilities(currentUser: User | null): FeatureCapabilities {
        return currentUser?.entitlements?.capabilities
            ?? currentUser?.capabilities
            ?? {};
    }

    getInventoryManagementCapability(
        currentUser: User | null,
        ownerType: "company" | "user" = "user",
    ): InventoryManagementCapability | null {
        if (!currentUser) {
            return null;
        }

        if (ownerType === "company") {
            return currentUser.companyContext?.entitlements?.capabilities.inventoryManagement
                ?? currentUser.companyContext?.capabilities?.inventoryManagement
                ?? null;
        }

        return currentUser.entitlements?.capabilities.inventoryManagement
            ?? currentUser.capabilities?.inventoryManagement
            ?? null;
    }
}
