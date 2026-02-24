import type {
    BillingSessionResult,
    CompanyMigrationResult,
    CreateCheckoutSessionInput,
    CreateCustomerPortalSessionInput,
    MigrateCompanyToExplorerInput,
} from "@/domain/models/Billing";
import type { BillingRepository } from "@/domain/repositories/BillingRepository";

export class BillingService {
    constructor(private readonly billingRepository: BillingRepository) {}

    async createCheckoutSession(
        input: CreateCheckoutSessionInput
    ): Promise<BillingSessionResult> {
        return this.billingRepository.createCheckoutSession(input);
    }

    async createCustomerPortalSession(
        input: CreateCustomerPortalSessionInput
    ): Promise<BillingSessionResult> {
        return this.billingRepository.createCustomerPortalSession(input);
    }

    async migrateCompanyToExplorer(
        input: MigrateCompanyToExplorerInput
    ): Promise<CompanyMigrationResult> {
        return this.billingRepository.migrateCompanyToExplorer(input);
    }
}
