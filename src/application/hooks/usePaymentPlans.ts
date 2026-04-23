import { useMutation, useQuery } from "@tanstack/react-query";

import { paymentPlanService, queryClient } from "@/compositionRoot";
import type {
    AssignPaymentPlanInput,
    PaymentPlanScope,
    UpdatePaymentPlanInput,
} from "@/domain/models/PaymentPlan";

export const PAYMENT_PLANS_QUERY_KEY = ["paymentPlans"] as const;

export const usePaymentPlans = (
    scope: PaymentPlanScope,
    options?: { checkoutOnly?: boolean; enabled?: boolean }
) => {
    const checkoutOnly = options?.checkoutOnly === true;

    return useQuery({
        queryKey: [...PAYMENT_PLANS_QUERY_KEY, scope, checkoutOnly ? "checkout" : "admin"],
        queryFn: () => paymentPlanService.listPlans(scope, checkoutOnly),
        enabled: options?.enabled ?? true,
    });
};

export const usePaymentPlanSubscribers = (
    scope: PaymentPlanScope,
    planCode?: string | null,
    enabled = true
) => {
    return useQuery({
        queryKey: [...PAYMENT_PLANS_QUERY_KEY, scope, planCode ?? "none", "subscribers"],
        queryFn: () => paymentPlanService.listSubscribers(scope, planCode ?? ""),
        enabled: enabled && typeof planCode === "string" && planCode.length > 0,
    });
};

export const useUpdatePaymentPlan = () => {
    return useMutation({
        mutationFn: (input: UpdatePaymentPlanInput) => paymentPlanService.updatePlan(input),
        onSuccess: async (_data, variables) => {
            await queryClient.invalidateQueries({
                queryKey: [...PAYMENT_PLANS_QUERY_KEY, variables.scope ?? "company"],
            });
            await queryClient.invalidateQueries({ queryKey: PAYMENT_PLANS_QUERY_KEY });
        },
    });
};

export const useAssignPaymentPlan = () => {
    return useMutation({
        mutationFn: (input: AssignPaymentPlanInput) => paymentPlanService.assignPlan(input),
        onSuccess: async (_data, variables) => {
            await queryClient.invalidateQueries({ queryKey: PAYMENT_PLANS_QUERY_KEY });
            await queryClient.invalidateQueries({
                queryKey: [...PAYMENT_PLANS_QUERY_KEY, variables.scope, variables.planCode, "subscribers"],
            });
            await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        },
    });
};
