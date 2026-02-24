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
    productSlotLimit?: number | null;
}

export const isSubscriptionActive = (status: SubscriptionStatus | string | null | undefined): boolean => {
    return status === "active";
};

export const getEffectiveUserPlan = (
    planType: UserPlanType | null | undefined,
    subscriptionStatus: SubscriptionStatus | string | null | undefined
): UserPlanType => {
    if (planType === "user_pro" && isSubscriptionActive(subscriptionStatus)) {
        return "user_pro";
    }

    return "explorer";
};

export const getUserPlanProductLimit = (
    planType: UserPlanType | null | undefined,
    subscriptionStatus?: SubscriptionStatus | string | null
): number => {
    const effectivePlan = getEffectiveUserPlan(planType, subscriptionStatus);

    if (effectivePlan === "user_pro") {
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

    const effectivePlan = isSubscriptionActive(context.subscriptionStatus)
        ? context.planType
        : "starter";

    switch (effectivePlan) {
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

    if (!isSubscriptionActive(context.subscriptionStatus)) {
        return false;
    }

    return context.planType === "pro" || context.planType === "enterprise";
};
