import type {
    BillingSessionResult,
    CheckoutSessionSynchronizationResult,
    CompanyMigrationResult,
    CreateCheckoutSessionInput,
    CreateCustomerPortalSessionInput,
    MigrateCompanyToExplorerInput,
    SynchronizeCheckoutSessionInput,
} from "@/domain/models/Billing";

export interface BillingRepository {
    createCheckoutSession(input: CreateCheckoutSessionInput): Promise<BillingSessionResult>;
    createCustomerPortalSession(input: CreateCustomerPortalSessionInput): Promise<BillingSessionResult>;
    synchronizeCheckoutSession(input: SynchronizeCheckoutSessionInput): Promise<CheckoutSessionSynchronizationResult>;
    migrateCompanyToExplorer(input: MigrateCompanyToExplorerInput): Promise<CompanyMigrationResult>;
}
