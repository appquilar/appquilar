import type {
    BillingSessionResult,
    CompanyMigrationResult,
    CreateCheckoutSessionInput,
    CreateCustomerPortalSessionInput,
    MigrateCompanyToExplorerInput,
} from "@/domain/models/Billing";

export interface BillingRepository {
    createCheckoutSession(input: CreateCheckoutSessionInput): Promise<BillingSessionResult>;
    createCustomerPortalSession(input: CreateCustomerPortalSessionInput): Promise<BillingSessionResult>;
    migrateCompanyToExplorer(input: MigrateCompanyToExplorerInput): Promise<CompanyMigrationResult>;
}
