import { useReactivateSubscription } from "@/application/hooks/useBilling";
import { useAuth } from "@/context/AuthContext";
import { extractBackendErrorCode } from "@/utils/backendError";
import { getBillingErrorMessage } from "@/utils/billingError";

const USER_PRO_REACTIVATION_NOT_AVAILABLE_MESSAGE =
    "Esta suscripcion ya no puede mantenerse automaticamente. Inicia un nuevo checkout para volver a User Pro.";

export const getUserSubscriptionReactivationErrorMessage = (
    error: unknown,
    fallback: string
): string => {
    if (
        extractBackendErrorCode(error) ===
        "billing.subscription.reactivation_not_available"
    ) {
        return USER_PRO_REACTIVATION_NOT_AVAILABLE_MESSAGE;
    }

    return getBillingErrorMessage(error, fallback);
};

export const useUserSubscriptionReactivation = () => {
    const { currentUser, refreshCurrentUser } = useAuth();
    const reactivateSubscriptionMutation = useReactivateSubscription();

    const isReactivationAvailable =
        currentUser?.planType === "user_pro" &&
        currentUser.subscriptionStatus === "active" &&
        currentUser.subscriptionCancelAtPeriodEnd === true;

    const reactivate = async (): Promise<void> => {
        await reactivateSubscriptionMutation.mutateAsync({
            scope: "user",
        });
        await refreshCurrentUser();
    };

    return {
        reactivate,
        isPending: reactivateSubscriptionMutation.isPending,
        isReactivationAvailable,
    };
};
