import type {
    BillingSessionResult,
    CreateCheckoutSessionInput,
    CreateCustomerPortalSessionInput,
} from "@/domain/models/Billing";

export interface BillingRepository {
    createCheckoutSession(input: CreateCheckoutSessionInput): Promise<BillingSessionResult>;
    createCustomerPortalSession(input: CreateCustomerPortalSessionInput): Promise<BillingSessionResult>;
}
