import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import type { CompanyPlanType, UserPlanType } from "@/domain/models/Subscription";
import { UserRole } from "@/domain/models/UserRole";

interface PlanGuardProps {
    children: ReactNode;
    fallback?: ReactNode;
    requiredUserPlans?: UserPlanType[];
    requiredCompanyPlans?: CompanyPlanType[];
    requireCompanyContext?: boolean;
}

const PlanGuard = ({
    children,
    fallback = null,
    requiredUserPlans,
    requiredCompanyPlans,
    requireCompanyContext = false,
}: PlanGuardProps) => {
    const { currentUser, isLoading } = useAuth();

    if (isLoading) {
        return null;
    }

    if (!currentUser) {
        return <>{fallback}</>;
    }

    if (currentUser.roles.includes(UserRole.ADMIN)) {
        return <>{children}</>;
    }

    const companyContext = currentUser.companyContext ?? null;

    if (requireCompanyContext && !companyContext) {
        return <>{fallback}</>;
    }

    if (requiredCompanyPlans && requiredCompanyPlans.length > 0) {
        if (!companyContext) {
            return <>{fallback}</>;
        }

        const effectiveCompanyPlan = companyContext.isFoundingAccount
            ? "enterprise"
            : companyContext.planType;

        if (!requiredCompanyPlans.includes(effectiveCompanyPlan)) {
            return <>{fallback}</>;
        }
    }

    if (requiredUserPlans && requiredUserPlans.length > 0) {
        const userPlan = currentUser.planType ?? "explorer";
        if (!requiredUserPlans.includes(userPlan)) {
            return <>{fallback}</>;
        }
    }

    return <>{children}</>;
};

export default PlanGuard;

