import type {
    BillingSessionResult,
    CheckoutSessionSynchronizationResult,
    CompanyMigrationResult,
    CreateCheckoutSessionInput,
    CreateCustomerPortalSessionInput,
    MigrateCompanyToExplorerInput,
    ReactivateSubscriptionInput,
    SubscriptionReactivationResult,
    SynchronizeCheckoutSessionInput,
} from "@/domain/models/Billing";

export interface BillingRepository {
    createCheckoutSession(input: CreateCheckoutSessionInput): Promise<BillingSessionResult>;
    createCustomerPortalSession(input: CreateCustomerPortalSessionInput): Promise<BillingSessionResult>;
    reactivateSubscription(input: ReactivateSubscriptionInput): Promise<SubscriptionReactivationResult>;
    synchronizeCheckoutSession(input: SynchronizeCheckoutSessionInput): Promise<CheckoutSessionSynchronizationResult>;
    migrateCompanyToExplorer(input: MigrateCompanyToExplorerInput): Promise<CompanyMigrationResult>;
}
