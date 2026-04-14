import { useMemo } from "react";
import { capabilityService } from "@/compositionRoot";
import { useCurrentUser } from "@/application/hooks/useCurrentUser";

export const useCapabilities = () => {
    const { user, isLoading } = useCurrentUser();

    const capabilities = useMemo(() => capabilityService.getCapabilities(user), [user]);

    return {
        capabilities,
        isLoading,
    };
};

export const useCanManageInventory = (ownerType: "company" | "user" = "user") => {
    const { user, isLoading } = useCurrentUser();

    const capability = useMemo(
        () => capabilityService.getInventoryManagementCapability(user, ownerType),
        [ownerType, user]
    );

    return {
        capability,
        canManageInventory: capability?.state === "enabled",
        hasInventoryReadAccess: capability?.state === "enabled" || capability?.state === "read_only",
        isReadOnly: capability?.state === "read_only",
        isLoading,
    };
};
