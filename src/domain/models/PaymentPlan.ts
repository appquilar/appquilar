import type { BillingPlanType, BillingScope } from "@/domain/models/Billing";
import type {
    FeatureCapabilities,
    SubscriptionQuotaSet,
    SubscriptionStatus,
} from "@/domain/models/Subscription";

export type PaymentPlanScope = BillingScope;

export interface PaymentPlanPrice {
    amount: number | null;
    currency: string | null;
    interval: string | null;
    stripeProductId: string | null;
    stripePriceId: string | null;
    version: number;
}

export interface PaymentPlan {
    id: string;
    planCode: BillingPlanType;
    scope: PaymentPlanScope;
    displayName: string;
    subtitle: string | null;
    marketingMessage: string | null;
    badgeText: string | null;
    featureList: string[];
    quotas: SubscriptionQuotaSet;
    capabilities: FeatureCapabilities;
    sortOrder: number;
    isActive: boolean;
    isVisibleInCheckout: boolean;
    isCheckoutEnabled: boolean;
    isManualAssignmentEnabled: boolean;
    price: PaymentPlanPrice;
}

export interface PaymentPlanSubscriber {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    name: string | null;
    slug: string | null;
    contactEmail: string | null;
    subscriptionStatus: SubscriptionStatus;
    planType: string;
    isFoundingAccount: boolean | null;
}

export interface UpdatePaymentPlanInput {
    scope: PaymentPlanScope;
    planCode: BillingPlanType;
    displayName: string;
    subtitle: string | null;
    marketingMessage: string | null;
    badgeText: string | null;
    featureList: string[];
    quotas: SubscriptionQuotaSet;
    capabilities: FeatureCapabilities;
    sortOrder: number;
    isActive: boolean;
    isVisibleInCheckout: boolean;
    isCheckoutEnabled: boolean;
    isManualAssignmentEnabled: boolean;
    priceAmount: number | null;
    priceCurrency: string | null;
    priceInterval: string | null;
    stripeProductId: string | null;
}

export interface AssignPaymentPlanInput {
    scope: PaymentPlanScope;
    planCode: BillingPlanType;
    targetId: string;
    subscriptionStatus?: SubscriptionStatus | null;
}
