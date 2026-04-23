import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { billingService, queryClient } from "@/compositionRoot";
import { useAuth } from "@/context/AuthContext";
import type { User } from "@/domain/models/User";
import type { BillingPlanType, BillingScope } from "@/domain/models/Billing";
import {
    isSubscriptionActive,
    type CompanyPlanType,
    type SubscriptionStatus,
    type UserPlanType,
} from "@/domain/models/Subscription";

const BILLING_SYNC_PARAM = "aq_billing_sync";
const BILLING_SCOPE_PARAM = "aq_billing_scope";
const BILLING_PLAN_PARAM = "aq_billing_plan";
const BILLING_SESSION_ID_PARAM = "session_id";
const BILLING_CURRENT_PLAN_PARAM = "aq_billing_current_plan";
const BILLING_CURRENT_STATUS_PARAM = "aq_billing_current_status";
const BILLING_CURRENT_CANCEL_AT_PERIOD_END_PARAM =
    "aq_billing_current_cancel_at_period_end";
const BILLING_SYNC_DELAY_MS = 1500;
const BILLING_SYNC_MAX_ATTEMPTS = 12;
const BILLING_SYNC_STORAGE_KEY = "appquilar:billing:return-sync";
const BILLING_SYNC_STORAGE_TTL_MS = 10 * 60 * 1000;
const BILLING_SYNC_BROADCAST_KEY = "appquilar:billing:return-sync-completed";
const BILLING_RETURN_FALLBACK_ORIGIN = "http://localhost";
const BILLING_CHECKOUT_SESSION_PLACEHOLDER = "{CHECKOUT_SESSION_ID}";

type SubscriptionPlanType = UserPlanType | CompanyPlanType;

interface BillingSubscriptionSnapshot {
    planType: SubscriptionPlanType | null;
    subscriptionStatus: SubscriptionStatus | null;
    subscriptionCancelAtPeriodEnd: boolean;
}

interface BillingReturnContext {
    scope: BillingScope;
    expectedPlanType: BillingPlanType | null;
    sessionId: string | null;
    currentState: BillingSubscriptionSnapshot | null;
}

interface PersistedBillingReturnContext {
    scope?: string | null;
    expectedPlanType?: string | null;
    sessionId?: string | null;
    startedAtMs?: number | null;
    currentState?: {
        planType?: string | null;
        subscriptionStatus?: string | null;
        subscriptionCancelAtPeriodEnd?: boolean | null;
    } | null;
}

interface BillingSyncBroadcastPayload {
    scope: BillingScope;
    completedAtMs: number;
}

const isBillingScope = (value: string | null): value is BillingScope =>
    value === "user" || value === "company";

const isBillingPlanType = (value: string | null): value is BillingPlanType =>
    value === "user_pro" ||
    value === "starter" ||
    value === "pro" ||
    value === "enterprise" ||
    value === "early_bird";

const isSubscriptionPlanType = (
    value: string | null
): value is SubscriptionPlanType =>
    value === "explorer" || isBillingPlanType(value);

const isSubscriptionStatus = (
    value: string | null
): value is SubscriptionStatus =>
    value === "active" || value === "paused" || value === "canceled";

const parseCancelAtPeriodEndValue = (value: string | null): boolean =>
    value === "1";

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
    url.searchParams.delete(BILLING_CURRENT_PLAN_PARAM);
    url.searchParams.delete(BILLING_CURRENT_STATUS_PARAM);
    url.searchParams.delete(BILLING_CURRENT_CANCEL_AT_PERIOD_END_PARAM);

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

    return url.toString();
};

export const buildBillingPortalReturnUrl = (
    baseUrl: string,
    scope: BillingScope,
    currentState: BillingSubscriptionSnapshot
): string => {
    const url = new URL(buildBillingReturnUrl(baseUrl, scope));

    if (currentState.planType) {
        url.searchParams.set(BILLING_CURRENT_PLAN_PARAM, currentState.planType);
    }

    if (currentState.subscriptionStatus) {
        url.searchParams.set(
            BILLING_CURRENT_STATUS_PARAM,
            currentState.subscriptionStatus
        );
    }

    url.searchParams.set(
        BILLING_CURRENT_CANCEL_AT_PERIOD_END_PARAM,
        currentState.subscriptionCancelAtPeriodEnd ? "1" : "0"
    );

    return url.toString();
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
    const currentPlanTypeParam = searchParams.get(BILLING_CURRENT_PLAN_PARAM);
    const currentStatusParam = searchParams.get(BILLING_CURRENT_STATUS_PARAM);
    const currentState =
        isSubscriptionPlanType(currentPlanTypeParam) &&
        isSubscriptionStatus(currentStatusParam)
            ? {
                  planType: currentPlanTypeParam,
                  subscriptionStatus: currentStatusParam,
                  subscriptionCancelAtPeriodEnd: parseCancelAtPeriodEndValue(
                      searchParams.get(BILLING_CURRENT_CANCEL_AT_PERIOD_END_PARAM)
                  ),
              }
            : null;

    return {
        scope,
        expectedPlanType: isBillingPlanType(planTypeParam)
            ? planTypeParam
            : null,
        sessionId: searchParams.get(BILLING_SESSION_ID_PARAM),
        currentState,
    };
};

const canUseSessionStorage = (): boolean =>
    typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";

const canUseLocalStorage = (): boolean =>
    typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const persistBillingReturnContext = (context: BillingReturnContext): void => {
    if (!canUseSessionStorage()) {
        return;
    }

    try {
        const persistedContext: PersistedBillingReturnContext = {
            ...context,
            startedAtMs: Date.now(),
        };

        window.sessionStorage.setItem(
            BILLING_SYNC_STORAGE_KEY,
            JSON.stringify(persistedContext)
        );
    } catch {
        // Ignore storage write failures and keep the in-memory flow working.
    }
};

const clearPersistedBillingReturnContext = (): void => {
    if (!canUseSessionStorage()) {
        return;
    }

    try {
        window.sessionStorage.removeItem(BILLING_SYNC_STORAGE_KEY);
    } catch {
        // Ignore storage cleanup failures.
    }
};

const broadcastBillingSyncCompletion = (scope: BillingScope): void => {
    if (!canUseLocalStorage()) {
        return;
    }

    try {
        const payload: BillingSyncBroadcastPayload = {
            scope,
            completedAtMs: Date.now(),
        };

        window.localStorage.setItem(
            BILLING_SYNC_BROADCAST_KEY,
            JSON.stringify(payload)
        );
    } catch {
        // Ignore broadcast failures; same-tab sync still works.
    }
};

const readPersistedBillingReturnContext = (): BillingReturnContext | null => {
    if (!canUseSessionStorage()) {
        return null;
    }

    try {
        const rawValue = window.sessionStorage.getItem(BILLING_SYNC_STORAGE_KEY);
        if (!rawValue) {
            return null;
        }

        const parsed = JSON.parse(rawValue) as PersistedBillingReturnContext;
        const startedAtMs =
            typeof parsed.startedAtMs === "number" ? parsed.startedAtMs : null;
        if (
            startedAtMs !== null &&
            Date.now() - startedAtMs > BILLING_SYNC_STORAGE_TTL_MS
        ) {
            clearPersistedBillingReturnContext();
            return null;
        }

        const scope = parsed.scope ?? null;
        if (!isBillingScope(scope)) {
            clearPersistedBillingReturnContext();
            return null;
        }

        const parsedExpectedPlanType = parsed.expectedPlanType ?? null;
        const expectedPlanType = isBillingPlanType(parsedExpectedPlanType)
            ? parsedExpectedPlanType
            : null;

        const currentPlanType = parsed.currentState?.planType ?? null;
        const currentSubscriptionStatus =
            parsed.currentState?.subscriptionStatus ?? null;
        const currentState =
            isSubscriptionPlanType(currentPlanType) &&
            isSubscriptionStatus(currentSubscriptionStatus)
                ? {
                      planType: currentPlanType,
                      subscriptionStatus: currentSubscriptionStatus,
                      subscriptionCancelAtPeriodEnd:
                          parsed.currentState?.subscriptionCancelAtPeriodEnd ===
                          true,
                  }
                : null;

        return {
            scope,
            expectedPlanType,
            sessionId:
                typeof parsed.sessionId === "string" && parsed.sessionId.trim() !== ""
                    ? parsed.sessionId
                    : null,
            currentState,
        };
    } catch {
        clearPersistedBillingReturnContext();
        return null;
    }
};

const stripBillingSyncParamsFromSearch = (search: string): string => {
    const searchParams = new URLSearchParams(search);
    searchParams.delete(BILLING_SYNC_PARAM);
    searchParams.delete(BILLING_SCOPE_PARAM);
    searchParams.delete(BILLING_PLAN_PARAM);
    searchParams.delete(BILLING_SESSION_ID_PARAM);
    searchParams.delete(BILLING_CURRENT_PLAN_PARAM);
    searchParams.delete(BILLING_CURRENT_STATUS_PARAM);
    searchParams.delete(BILLING_CURRENT_CANCEL_AT_PERIOD_END_PARAM);

    return searchParams.toString();
};

const getCurrentSubscriptionSnapshot = (
    currentUser: User | null,
    scope: BillingScope
): BillingSubscriptionSnapshot => {
    if (!currentUser) {
        return {
            planType: null,
            subscriptionStatus: null,
            subscriptionCancelAtPeriodEnd: false,
        };
    }

    if (scope === "user") {
        return {
            planType: currentUser.planType ?? null,
            subscriptionStatus: currentUser.subscriptionStatus ?? null,
            subscriptionCancelAtPeriodEnd:
                currentUser.subscriptionCancelAtPeriodEnd === true,
        };
    }

    return {
        planType: currentUser.companyContext?.planType ?? null,
        subscriptionStatus: currentUser.companyContext?.subscriptionStatus ?? null,
        subscriptionCancelAtPeriodEnd:
            currentUser.companyContext?.subscriptionCancelAtPeriodEnd === true,
    };
};

const isExpectedSubscriptionSynced = (
    currentUser: User | null,
    context: BillingReturnContext
): boolean => {
    if (!currentUser || !context.expectedPlanType) {
        return false;
    }

    if (context.scope === "user") {
        return (
            currentUser.planType === context.expectedPlanType &&
            isSubscriptionActive(currentUser.subscriptionStatus)
        );
    }

    const companyContext = currentUser.companyContext;
    if (!companyContext) {
        return false;
    }

    return (
        companyContext.planType === context.expectedPlanType &&
        isSubscriptionActive(companyContext.subscriptionStatus)
    );
};

const hasObservedSubscriptionStateChange = (
    currentUser: User | null,
    context: BillingReturnContext
): boolean => {
    if (!context.currentState) {
        return false;
    }

    const currentState = getCurrentSubscriptionSnapshot(
        currentUser,
        context.scope
    );

    return (
        currentState.planType !== context.currentState.planType ||
        currentState.subscriptionStatus !==
            context.currentState.subscriptionStatus ||
        currentState.subscriptionCancelAtPeriodEnd !==
            context.currentState.subscriptionCancelAtPeriodEnd
    );
};

const isBillingReturnSynchronized = (
    currentUser: User | null,
    context: BillingReturnContext
): boolean => {
    if (context.expectedPlanType) {
        return isExpectedSubscriptionSynced(currentUser, context);
    }

    if (context.currentState) {
        return hasObservedSubscriptionStateChange(currentUser, context);
    }

    return false;
};

const wait = async (delayMs: number): Promise<void> =>
    new Promise((resolve) => {
        window.setTimeout(resolve, delayMs);
    });

export const useBillingReturnSync = (): void => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, refreshCurrentUser, isAuthenticated } = useAuth();
    const authStateRef = useRef({
        currentUser,
        refreshCurrentUser,
        isAuthenticated,
    });

    useEffect(() => {
        authStateRef.current = {
            currentUser,
            refreshCurrentUser,
            isAuthenticated,
        };
    }, [currentUser, refreshCurrentUser, isAuthenticated]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const handleStorage = (event: StorageEvent) => {
            if (
                event.key !== BILLING_SYNC_BROADCAST_KEY ||
                !event.newValue ||
                !authStateRef.current.isAuthenticated
            ) {
                return;
            }

            void authStateRef.current.refreshCurrentUser();
        };

        window.addEventListener("storage", handleStorage);

        return () => {
            window.removeEventListener("storage", handleStorage);
        };
    }, []);

    useEffect(() => {
        const locationBillingReturnContext = readBillingReturnContext(
            location.search
        );
        if (locationBillingReturnContext) {
            persistBillingReturnContext(locationBillingReturnContext);
        }

        const billingReturnContext =
            locationBillingReturnContext ?? readPersistedBillingReturnContext();
        if (!billingReturnContext) {
            return;
        }

        let isCancelled = false;
        let hasCleanedUp = false;

        const cleanCurrentLocation = () => {
            const currentSearch = location.search.startsWith("?")
                ? location.search.slice(1)
                : location.search;
            const nextSearch = stripBillingSyncParamsFromSearch(currentSearch);

            if (nextSearch === currentSearch) {
                return;
            }

            navigate(
                {
                    pathname: location.pathname,
                    search: nextSearch ? `?${nextSearch}` : "",
                    hash: location.hash,
                },
                { replace: true }
            );
        };

        const finalizeBillingSync = () => {
            hasCleanedUp = true;
            clearPersistedBillingReturnContext();
            cleanCurrentLocation();
        };

        const synchronizeBillingState = async () => {
            try {
                if (!authStateRef.current.isAuthenticated) {
                    finalizeBillingSync();
                    return;
                }

                if (
                    isBillingReturnSynchronized(
                        authStateRef.current.currentUser,
                        billingReturnContext
                    )
                ) {
                    broadcastBillingSyncCompletion(billingReturnContext.scope);
                    finalizeBillingSync();
                    return;
                }

                const attempts = (
                    billingReturnContext.expectedPlanType ||
                    billingReturnContext.currentState
                )
                    ? BILLING_SYNC_MAX_ATTEMPTS
                    : 1;

                if (billingReturnContext.sessionId) {
                    try {
                        await billingService.synchronizeCheckoutSession({
                            scope: billingReturnContext.scope,
                            sessionId: billingReturnContext.sessionId,
                        });
                    } catch (error) {
                        console.warn(
                            "Billing checkout session synchronization failed; retrying current user refresh.",
                            error
                        );
                    }
                }

                for (let attempt = 0; attempt < attempts; attempt += 1) {
                    if (isCancelled) {
                        return;
                    }

                    if (!authStateRef.current.isAuthenticated) {
                        finalizeBillingSync();
                        return;
                    }

                    const refreshedUser =
                        await authStateRef.current.refreshCurrentUser();
                    await queryClient.invalidateQueries({ queryKey: ["currentUser"] });

                    if (
                        (!billingReturnContext.expectedPlanType &&
                            !billingReturnContext.currentState) ||
                        isBillingReturnSynchronized(
                            refreshedUser,
                            billingReturnContext
                        )
                    ) {
                        broadcastBillingSyncCompletion(billingReturnContext.scope);
                        finalizeBillingSync();
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
        location.hash,
        location.pathname,
        location.search,
        navigate,
    ]);
};
