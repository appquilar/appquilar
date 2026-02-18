import type { CompanyPlanType, SubscriptionStatus } from "@/domain/models/Subscription";

export interface CompanyAdminSummary {
    id: string;
    ownerId: string | null;
    name: string;
    slug: string;
    description: string | null;
    fiscalIdentifier: string | null;
    contactEmail: string | null;
    planType: CompanyPlanType;
    subscriptionStatus: SubscriptionStatus;
    isFoundingAccount: boolean;
}
