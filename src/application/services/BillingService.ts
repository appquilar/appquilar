import type {
    BillingSessionResult,
    CreateCheckoutSessionInput,
    CreateCustomerPortalSessionInput,
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
}
