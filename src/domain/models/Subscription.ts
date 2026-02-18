export type SubscriptionStatus = "active" | "paused" | "canceled";

export type UserPlanType = "explorer" | "user_pro";
export type CompanyPlanType = "starter" | "pro" | "enterprise";

export type CompanyUserRoleType = "ROLE_ADMIN" | "ROLE_CONTRIBUTOR";

export interface CompanyContext {
    companyId: string;
    companyName: string;
    companyRole: CompanyUserRoleType;
    isCompanyOwner: boolean;
    planType: CompanyPlanType;
    subscriptionStatus: SubscriptionStatus;
    isFoundingAccount: boolean;
}

export const getUserPlanProductLimit = (planType: UserPlanType | null | undefined): number => {
    if (planType === "user_pro") {
        return 5;
    }

    return 2;
};

export const getCompanyPlanProductLimit = (context: CompanyContext | null | undefined): number | null => {
    if (!context) {
        return null;
    }

    if (context.isFoundingAccount) {
        return null;
    }

    switch (context.planType) {
        case "starter":
            return 10;
        case "pro":
            return 50;
        default:
            return null;
    }
};

export const isCompanyAdvancedAnalyticsEnabled = (
    context: CompanyContext | null | undefined
): boolean => {
    if (!context) {
        return false;
    }

    if (context.isFoundingAccount) {
        return true;
    }

    return context.planType === "pro" || context.planType === "enterprise";
};

