import type {
    BillingSessionResult,
    CheckoutSessionSynchronizationResult,
    CompanyMigrationResult,
    CreateCompanyUpgradeCheckoutSessionInput,
    CreateCheckoutSessionInput,
    CreateCustomerPortalSessionInput,
    MigrateCompanyToExplorerInput,
    ReactivateSubscriptionInput,
    SubscriptionReactivationResult,
    SubscriptionSynchronizationResult,
    SynchronizeCheckoutSessionInput,
    SynchronizeSubscriptionInput,
} from "@/domain/models/Billing";

export interface BillingRepository {
    createCheckoutSession(input: CreateCheckoutSessionInput): Promise<BillingSessionResult>;
    createCompanyUpgradeCheckoutSession(input: CreateCompanyUpgradeCheckoutSessionInput): Promise<BillingSessionResult>;
    createCustomerPortalSession(input: CreateCustomerPortalSessionInput): Promise<BillingSessionResult>;
    reactivateSubscription(input: ReactivateSubscriptionInput): Promise<SubscriptionReactivationResult>;
    synchronizeSubscription(input: SynchronizeSubscriptionInput): Promise<SubscriptionSynchronizationResult>;
    synchronizeCheckoutSession(input: SynchronizeCheckoutSessionInput): Promise<CheckoutSessionSynchronizationResult>;
    migrateCompanyToExplorer(input: MigrateCompanyToExplorerInput): Promise<CompanyMigrationResult>;
}
