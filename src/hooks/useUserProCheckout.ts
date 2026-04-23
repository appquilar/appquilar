import { useMemo } from "react";

import { usePaymentPlans } from "@/application/hooks/usePaymentPlans";
import type { PaymentPlan } from "@/domain/models/PaymentPlan";
import { extractBackendErrorCode } from "@/utils/backendError";
import { getBillingErrorMessage } from "@/utils/billingError";

const USER_PRO_UNAVAILABLE_MESSAGE =
    "User Pro no esta disponible para activar ahora mismo.";
const USER_PRO_STRIPE_NOT_CONFIGURED_MESSAGE =
    "User Pro todavia no esta configurado para checkout en Stripe.";

const hasStripeBillableId = (plan: PaymentPlan | null | undefined): boolean =>
    Boolean(plan?.price.stripePriceId?.trim() || plan?.price.stripeProductId?.trim());

export const getUserProCheckoutErrorMessage = (
    error: unknown,
    fallback: string
): string => {
    const backendErrorCode = extractBackendErrorCode(error);

    if (
        backendErrorCode === "billing.stripe.price_not_configured.user_pro" ||
        backendErrorCode === "billing.plan_type.not_available"
    ) {
        return USER_PRO_STRIPE_NOT_CONFIGURED_MESSAGE;
    }

    return getBillingErrorMessage(error, fallback);
};

export const useUserProCheckout = () => {
    const paymentPlansQuery = usePaymentPlans("user", { checkoutOnly: true });

    const userProPlan = useMemo(
        () =>
            (paymentPlansQuery.data ?? []).find(
                (plan) => plan.planCode === "user_pro"
            ) ?? null,
        [paymentPlansQuery.data]
    );

    const isCheckoutAvailable = Boolean(
        userProPlan?.isCheckoutEnabled && hasStripeBillableId(userProPlan)
    );

    const unavailableMessage = useMemo(() => {
        if (paymentPlansQuery.isLoading) {
            return "Estamos comprobando la disponibilidad de User Pro.";
        }

        if (paymentPlansQuery.isError) {
            return USER_PRO_UNAVAILABLE_MESSAGE;
        }

        if (userProPlan === null || !userProPlan.isCheckoutEnabled) {
            return USER_PRO_UNAVAILABLE_MESSAGE;
        }

        if (!hasStripeBillableId(userProPlan)) {
            return USER_PRO_STRIPE_NOT_CONFIGURED_MESSAGE;
        }

        return null;
    }, [paymentPlansQuery.isError, paymentPlansQuery.isLoading, userProPlan]);

    return {
        isLoading: paymentPlansQuery.isLoading,
        isCheckoutAvailable,
        unavailableMessage,
        userProPlan,
    };
};
