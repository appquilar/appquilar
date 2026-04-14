export type SubscriptionStatus = "active" | "paused" | "canceled";

export type UserPlanType = "explorer" | "user_pro";
export type CompanyPlanType = "starter" | "pro" | "enterprise";

export type CompanyUserRoleType = "ROLE_ADMIN" | "ROLE_CONTRIBUTOR";
export type CapabilityState = "enabled" | "read_only" | "disabled";

export interface GenericCapabilityLimits {
    [key: string]: number | null;
}

export interface FeatureCapability {
    state: CapabilityState;
    limits?: GenericCapabilityLimits | null;
}

export interface CapabilityLimits {
    maxProductsWithInventory: number | null;
    maxQuantityPerProduct: number | null;
}

export interface InventoryManagementCapability {
    state: CapabilityState;
    limits: CapabilityLimits;
}

export interface FeatureCapabilities {
    inventoryManagement?: InventoryManagementCapability | null;
    advancedAnalytics?: FeatureCapability | null;
    customDomain?: FeatureCapability | null;
    branding?: FeatureCapability | null;
    apiAccess?: FeatureCapability | null;
}

export interface SubscriptionQuotaSet {
    activeProducts: number | null;
    teamMembers: number | null;
}

export interface SubscriptionOverrides {
    isPlatformAdmin: boolean;
    isCompanyOwner: boolean;
    isCompanyAdmin: boolean;
    isFoundingAccount: boolean;
}

export interface SubscriptionEntitlements<TPlanType extends string = string> {
    planType: TPlanType;
    subscriptionStatus: SubscriptionStatus;
    quotas: SubscriptionQuotaSet;
    capabilities: FeatureCapabilities;
    overrides: SubscriptionOverrides;
}

export interface CompanyContext {
    companyId: string;
    companyName: string;
    companyRole: CompanyUserRoleType;
    isCompanyOwner: boolean;
    planType: CompanyPlanType;
    subscriptionStatus: SubscriptionStatus;
    isFoundingAccount: boolean;
    productSlotLimit?: number | null;
    capabilities?: FeatureCapabilities | null;
    entitlements?: SubscriptionEntitlements<CompanyPlanType> | null;
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
    subscriptionStatus?: SubscriptionStatus | string | null,
    entitlements?: SubscriptionEntitlements<UserPlanType> | null
): number | null => {
    if (entitlements) {
        return entitlements.quotas.activeProducts;
    }

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

    if (context.entitlements) {
        return context.entitlements.quotas.activeProducts;
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

    const entitlementsState = context.entitlements?.capabilities.advancedAnalytics?.state;
    if (entitlementsState) {
        return entitlementsState === "enabled";
    }

    if (context.isFoundingAccount) {
        return true;
    }

    if (!isSubscriptionActive(context.subscriptionStatus)) {
        return false;
    }

    return context.planType === "pro" || context.planType === "enterprise";
};

export const canManageInventoryCapability = (
    capability: InventoryManagementCapability | null | undefined
): boolean => capability?.state === "enabled";

export const hasInventoryReadAccess = (
    capability: InventoryManagementCapability | null | undefined
): boolean => capability?.state === "enabled" || capability?.state === "read_only";
