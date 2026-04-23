import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import type { CapabilityKey, CapabilityState } from "@/domain/models/Subscription";
import {
    hasCompanyCapabilityAccess,
    hasUserCapabilityAccess,
} from "@/domain/models/Subscription";
import { UserRole } from "@/domain/models/UserRole";

interface CapabilityRequirement {
    key: CapabilityKey;
    states?: CapabilityState[];
}

interface PlanGuardProps {
    children: ReactNode;
    fallback?: ReactNode;
    requiredUserCapabilities?: CapabilityRequirement[];
    requiredCompanyCapabilities?: CapabilityRequirement[];
    requireCompanyContext?: boolean;
}

const DEFAULT_ALLOWED_STATES: CapabilityState[] = ["enabled", "read_only"];

const PlanGuard = ({
    children,
    fallback = null,
    requiredUserCapabilities,
    requiredCompanyCapabilities,
    requireCompanyContext = false,
}: PlanGuardProps) => {
    const { currentUser, isLoading, hasRole } = useAuth();

    if (isLoading) {
        return null;
    }

    if (!currentUser) {
        return <>{fallback}</>;
    }

    if (hasRole(UserRole.ADMIN)) {
        return <>{children}</>;
    }

    const companyContext = currentUser.companyContext ?? null;

    if (requireCompanyContext && !companyContext) {
        return <>{fallback}</>;
    }

    if (requiredCompanyCapabilities && requiredCompanyCapabilities.length > 0) {
        if (!companyContext) {
            return <>{fallback}</>;
        }

        const hasRequiredCompanyCapabilities = requiredCompanyCapabilities.every((requirement) =>
            hasCompanyCapabilityAccess(
                companyContext,
                requirement.key,
                requirement.states ?? DEFAULT_ALLOWED_STATES
            )
        );

        if (!hasRequiredCompanyCapabilities) {
            return <>{fallback}</>;
        }
    }

    if (requiredUserCapabilities && requiredUserCapabilities.length > 0) {
        const hasRequiredUserCapabilities = requiredUserCapabilities.every((requirement) =>
            hasUserCapabilityAccess(
                currentUser,
                requirement.key,
                requirement.states ?? DEFAULT_ALLOWED_STATES
            )
        );

        if (!hasRequiredUserCapabilities) {
            return <>{fallback}</>;
        }
    }

    return <>{children}</>;
};

export default PlanGuard;
