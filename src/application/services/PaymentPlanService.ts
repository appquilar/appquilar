import type { PaymentPlanRepository } from "@/domain/repositories/PaymentPlanRepository";
import type {
    AssignPaymentPlanInput,
    PaymentPlan,
    PaymentPlanScope,
    PaymentPlanSubscriber,
    UpdatePaymentPlanInput,
} from "@/domain/models/PaymentPlan";

export class PaymentPlanService {
    constructor(private readonly paymentPlanRepository: PaymentPlanRepository) {}

    async listPlans(scope: PaymentPlanScope, checkoutOnly = false): Promise<PaymentPlan[]> {
        return this.paymentPlanRepository.listPlans(scope, checkoutOnly);
    }

    async updatePlan(input: UpdatePaymentPlanInput): Promise<void> {
        return this.paymentPlanRepository.updatePlan(input);
    }

    async listSubscribers(scope: PaymentPlanScope, planCode: string): Promise<PaymentPlanSubscriber[]> {
        return this.paymentPlanRepository.listSubscribers(scope, planCode);
    }

    async assignPlan(input: AssignPaymentPlanInput): Promise<void> {
        return this.paymentPlanRepository.assignPlan(input);
    }
}
