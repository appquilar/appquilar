import {
    extractBackendErrorCode,
    extractBackendErrorMessage,
    getErrorMessage,
} from "@/utils/backendError";

const STRIPE_CONNECTION_ERROR_MESSAGE =
    "No se pudo conectar con Stripe ahora mismo. Revisa la conexion de este entorno e intentalo de nuevo.";

const hasStripeConnectivityFailure = (error: unknown): boolean => {
    const backendErrorCode = extractBackendErrorCode(error);
    if (backendErrorCode === "billing.stripe.request_failed") {
        return true;
    }

    const backendMessage = extractBackendErrorMessage(error);
    if (!backendMessage) {
        return false;
    }

    return (
        backendMessage.includes("Could not resolve host") ||
        backendMessage.includes("api.stripe.com") ||
        backendMessage.includes("billing.stripe.request_failed")
    );
};

export const getBillingErrorMessage = (
    error: unknown,
    fallback: string
): string => {
    if (hasStripeConnectivityFailure(error)) {
        return STRIPE_CONNECTION_ERROR_MESSAGE;
    }

    return getErrorMessage(error, fallback);
};

export { STRIPE_CONNECTION_ERROR_MESSAGE };
