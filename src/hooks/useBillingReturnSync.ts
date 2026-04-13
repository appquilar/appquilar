import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { billingService, queryClient } from "@/compositionRoot";
import { useAuth } from "@/context/AuthContext";
import type { User } from "@/domain/models/User";
import type { BillingPlanType, BillingScope } from "@/domain/models/Billing";
import { isSubscriptionActive } from "@/domain/models/Subscription";

const BILLING_SYNC_PARAM = "aq_billing_sync";
const BILLING_SCOPE_PARAM = "aq_billing_scope";
const BILLING_PLAN_PARAM = "aq_billing_plan";
const BILLING_SESSION_ID_PARAM = "session_id";
const BILLING_SYNC_DELAY_MS = 1500;
const BILLING_SYNC_MAX_ATTEMPTS = 6;
const BILLING_RETURN_FALLBACK_ORIGIN = "http://localhost";
const BILLING_CHECKOUT_SESSION_PLACEHOLDER = "{CHECKOUT_SESSION_ID}";

interface BillingReturnContext {
    scope: BillingScope;
    planType: BillingPlanType | null;
    sessionId: string | null;
}

const isBillingScope = (value: string | null): value is BillingScope =>
    value === "user" || value === "company";

const isBillingPlanType = (value: string | null): value is BillingPlanType =>
    value === "user_pro" ||
    value === "starter" ||
    value === "pro" ||
    value === "enterprise";

const resolveOrigin = (): string => {
    if (typeof window !== "undefined" && window.location.origin) {
        return window.location.origin;
    }

    return BILLING_RETURN_FALLBACK_ORIGIN;
};

const buildUrl = (baseUrl: string): URL =>
    new URL(baseUrl, resolveOrigin());

const stripBillingSyncParams = (url: URL): URL => {
    url.searchParams.delete(BILLING_SYNC_PARAM);
    url.searchParams.delete(BILLING_SCOPE_PARAM);
    url.searchParams.delete(BILLING_PLAN_PARAM);
    url.searchParams.delete(BILLING_SESSION_ID_PARAM);

    return url;
};

export const buildBillingReturnUrl = (
    baseUrl: string,
    scope: BillingScope,
    planType?: BillingPlanType | null
): string => {
    const url = stripBillingSyncParams(buildUrl(baseUrl));

    url.searchParams.set(BILLING_SYNC_PARAM, "1");
    url.searchParams.set(BILLING_SCOPE_PARAM, scope);

    if (planType) {
        url.searchParams.set(BILLING_PLAN_PARAM, planType);
    }

    return url.toString();
};

export const buildBillingCheckoutSuccessUrl = (
    baseUrl: string,
    scope: BillingScope,
    planType?: BillingPlanType | null
): string => {
    const url = new URL(buildBillingReturnUrl(baseUrl, scope, planType));
    url.searchParams.set(
        BILLING_SESSION_ID_PARAM,
        BILLING_CHECKOUT_SESSION_PLACEHOLDER
    );

    return url
        .toString()
        .replace(
            encodeURIComponent(BILLING_CHECKOUT_SESSION_PLACEHOLDER),
            BILLING_CHECKOUT_SESSION_PLACEHOLDER
        );
};

export const buildBillingBaseUrl = (baseUrl: string): string =>
    stripBillingSyncParams(buildUrl(baseUrl)).toString();

export const readBillingReturnContext = (
    search: string
): BillingReturnContext | null => {
    const searchParams = new URLSearchParams(search);
    if (searchParams.get(BILLING_SYNC_PARAM) !== "1") {
        return null;
    }

    const scope = searchParams.get(BILLING_SCOPE_PARAM);
    if (!isBillingScope(scope)) {
        return null;
    }

    const planTypeParam = searchParams.get(BILLING_PLAN_PARAM);

    return {
        scope,
        planType: isBillingPlanType(planTypeParam) ? planTypeParam : null,
        sessionId: searchParams.get(BILLING_SESSION_ID_PARAM),
    };
};

const isExpectedSubscriptionSynced = (
    currentUser: User | null,
    context: BillingReturnContext
): boolean => {
    if (!currentUser || !context.planType) {
        return false;
    }

    if (context.scope === "user") {
        return (
            currentUser.planType === context.planType &&
            isSubscriptionActive(currentUser.subscriptionStatus)
        );
    }

    const companyContext = currentUser.companyContext;
    if (!companyContext) {
        return false;
    }

    return (
        companyContext.planType === context.planType &&
        isSubscriptionActive(companyContext.subscriptionStatus)
    );
};

const wait = async (delayMs: number): Promise<void> =>
    new Promise((resolve) => {
        window.setTimeout(resolve, delayMs);
    });

export const useBillingReturnSync = (): void => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, refreshCurrentUser, isAuthenticated } = useAuth();
    const handledLocationRef = useRef<string | null>(null);

    useEffect(() => {
        const billingReturnContext = readBillingReturnContext(location.search);
        if (!billingReturnContext) {
            handledLocationRef.current = null;
            return;
        }

        const locationKey = `${location.pathname}${location.search}${location.hash}`;
        if (handledLocationRef.current === locationKey) {
            return;
        }

        handledLocationRef.current = locationKey;

        let isCancelled = false;
        let hasCleanedUp = false;

        const cleanCurrentLocation = () => {
            hasCleanedUp = true;
            const searchParams = new URLSearchParams(location.search);
            searchParams.delete(BILLING_SYNC_PARAM);
            searchParams.delete(BILLING_SCOPE_PARAM);
            searchParams.delete(BILLING_PLAN_PARAM);
            searchParams.delete(BILLING_SESSION_ID_PARAM);

            const nextSearch = searchParams.toString();

            navigate(
                {
                    pathname: location.pathname,
                    search: nextSearch ? `?${nextSearch}` : "",
                    hash: location.hash,
                },
                { replace: true }
            );
        };

        const synchronizeBillingState = async () => {
            try {
                if (!isAuthenticated) {
                    cleanCurrentLocation();
                    return;
                }

                if (
                    billingReturnContext.planType &&
                    isExpectedSubscriptionSynced(currentUser, billingReturnContext)
                ) {
                    cleanCurrentLocation();
                    return;
                }

                const attempts = billingReturnContext.planType
                    ? BILLING_SYNC_MAX_ATTEMPTS
                    : 1;

                if (billingReturnContext.sessionId) {
                    await billingService.synchronizeCheckoutSession({
                        scope: billingReturnContext.scope,
                        sessionId: billingReturnContext.sessionId,
                    });
                }

                for (let attempt = 0; attempt < attempts; attempt += 1) {
                    if (isCancelled) {
                        return;
                    }

                    const refreshedUser = await refreshCurrentUser();
                    await queryClient.invalidateQueries({ queryKey: ["currentUser"] });

                    if (
                        !billingReturnContext.planType ||
                        isExpectedSubscriptionSynced(refreshedUser, billingReturnContext)
                    ) {
                        cleanCurrentLocation();
                        return;
                    }

                    if (attempt < attempts - 1) {
                        await wait(BILLING_SYNC_DELAY_MS);
                    }
                }
            } finally {
                if (!isCancelled && !hasCleanedUp) {
                    cleanCurrentLocation();
                }
            }
        };

        void synchronizeBillingState();

        return () => {
            isCancelled = true;
        };
    }, [
        currentUser,
        isAuthenticated,
        location.hash,
        location.pathname,
        location.search,
        navigate,
        refreshCurrentUser,
    ]);
};
