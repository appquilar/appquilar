import { useMutation } from "@tanstack/react-query";
import { billingService } from "@/compositionRoot";
import type {
    CreateCheckoutSessionInput,
    CreateCustomerPortalSessionInput,
} from "@/domain/models/Billing";

export const useCreateCheckoutSession = () => {
    return useMutation({
        mutationFn: (input: CreateCheckoutSessionInput) =>
            billingService.createCheckoutSession(input),
    });
};

export const useCreateCustomerPortalSession = () => {
    return useMutation({
        mutationFn: (input: CreateCustomerPortalSessionInput) =>
            billingService.createCustomerPortalSession(input),
    });
};
