import type {
    AssignPaymentPlanInput,
    PaymentPlan,
    PaymentPlanScope,
    PaymentPlanSubscriber,
    UpdatePaymentPlanInput,
} from "@/domain/models/PaymentPlan";

export interface PaymentPlanRepository {
    listPlans(scope: PaymentPlanScope, checkoutOnly?: boolean): Promise<PaymentPlan[]>;
    updatePlan(input: UpdatePaymentPlanInput): Promise<void>;
    listSubscribers(scope: PaymentPlanScope, planCode: string): Promise<PaymentPlanSubscriber[]>;
    assignPlan(input: AssignPaymentPlanInput): Promise<void>;
}
