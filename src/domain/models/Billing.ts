export type BillingScope = "user" | "company";

export type UserBillingPlanType = "user_pro";
export type CompanyBillingPlanType = "starter" | "pro" | "enterprise";
export type BillingPlanType = UserBillingPlanType | CompanyBillingPlanType;

export interface CreateCheckoutSessionInput {
    scope: BillingScope;
    planType: BillingPlanType;
    successUrl: string;
    cancelUrl: string;
}

export interface CreateCustomerPortalSessionInput {
    scope: BillingScope;
    returnUrl: string;
}

export interface BillingSessionResult {
    url: string;
}
