import { CreditCard, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/domain/models/UserRole";
import {
    useCreateCheckoutSession,
    useCreateCustomerPortalSession,
} from "@/application/hooks/useBilling";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    getEffectiveUserPlan,
    isSubscriptionActive,
    type UserPlanType,
} from "@/domain/models/Subscription";
import {
    buildBillingBaseUrl,
    buildBillingCheckoutSuccessUrl,
    buildBillingReturnUrl,
} from "@/hooks/useBillingReturnSync";
import { extractBackendErrorMessage } from "@/utils/backendError";

const USER_PLAN_LABELS: Record<UserPlanType, string> = {
    explorer: "Explorer",
    user_pro: "User Pro",
};

const STATUS_LABELS: Record<string, string> = {
    active: "Activa",
    paused: "Pausada",
    canceled: "Cancelada",
};

const statusBadgeClass = (status: string | null | undefined): string => {
    switch (status) {
        case "active":
            return "bg-emerald-100 text-emerald-700 border-emerald-200";
        case "paused":
            return "bg-amber-100 text-amber-700 border-amber-200";
        case "canceled":
            return "bg-rose-100 text-rose-700 border-rose-200";
        default:
            return "bg-muted text-muted-foreground";
    }
};

const UserSubscriptionSettingsCard = () => {
    const { currentUser, hasRole } = useAuth();
    const createPortalMutation = useCreateCustomerPortalSession();
    const createCheckoutMutation = useCreateCheckoutSession();
    const isPlatformAdmin = hasRole(UserRole.ADMIN);

    const hasCompanyProfile = Boolean(
        currentUser?.companyContext?.companyId ?? currentUser?.companyId
    );

    if (!currentUser || hasCompanyProfile || isPlatformAdmin) {
        return null;
    }

    const currentUrl = typeof window !== "undefined" ? window.location.href : "";
    const currentBaseUrl = buildBillingBaseUrl(currentUrl);
    const rawPlan: UserPlanType = currentUser.planType ?? "explorer";
    const currentStatus = currentUser.subscriptionStatus ?? "active";
    const currentPlan: UserPlanType = getEffectiveUserPlan(rawPlan, currentStatus);
    const isUserPro = currentPlan === "user_pro";
    const isSubscriptionInactive = !isSubscriptionActive(currentStatus);
    const displayedPlan: UserPlanType = isSubscriptionInactive ? "user_pro" : currentPlan;

    const handleOpenUserPortal = async () => {
        const newTab = window.open("", "_blank");
        if (!newTab) {
            toast.error("No se pudo abrir una nueva pestana. Revisa el bloqueador de ventanas emergentes.");
            return;
        }
        newTab.opener = null;

        try {
            const response = await createPortalMutation.mutateAsync({
                scope: "user",
                returnUrl: buildBillingReturnUrl(currentBaseUrl, "user"),
            });

            newTab.location.href = response.url;
        } catch (error) {
            newTab.close();
            console.error("Error creating user portal session", error);
            const backendError = extractBackendErrorMessage(error);
            toast.error(
                backendError ?? "No se pudo abrir el Customer Portal."
            );
        }
    };

    const handleUpgradeToUserPro = async () => {
        try {
            const response = await createCheckoutMutation.mutateAsync({
                scope: "user",
                planType: "user_pro",
                successUrl: buildBillingCheckoutSuccessUrl(
                    currentBaseUrl,
                    "user",
                    "user_pro"
                ),
                cancelUrl: currentBaseUrl,
            });

            window.location.assign(response.url);
        } catch (error) {
            console.error("Error creating user checkout session", error);
            const backendError = extractBackendErrorMessage(error);
            toast.error(
                backendError ?? "No se pudo iniciar el checkout para User Pro."
            );
        }
    };

    return (
        <div className="rounded-md border p-4 bg-muted/10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Suscripcion de usuario
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                        <Badge
                            variant="outline"
                            className="cursor-default bg-orange-200 text-orange-600 border-transparent"
                        >
                            {USER_PLAN_LABELS[displayedPlan] ?? displayedPlan}
                        </Badge>
                        {isUserPro ? (
                            <Badge
                                variant="outline"
                                className={`cursor-default ${statusBadgeClass(currentStatus)}`}
                            >
                                {STATUS_LABELS[currentStatus] ?? currentStatus}
                            </Badge>
                        ) : isSubscriptionInactive ? (
                            <Badge
                                variant="outline"
                                className={`cursor-default ${statusBadgeClass(currentStatus)}`}
                            >
                                {STATUS_LABELS[currentStatus] ?? currentStatus}
                            </Badge>
                        ) : (
                            <Badge
                                variant="outline"
                                className="cursor-default bg-slate-200 text-slate-700 border-transparent"
                            >
                                Gratuita
                            </Badge>
                        )}
                    </div>
                    {!isUserPro && (
                        <p className="text-xs text-muted-foreground">
                            {isSubscriptionInactive
                                ? "Tu suscripcion no esta activa. Revisa Stripe para reactivar User Pro y recuperar metricas."
                                : "Activa User Pro para ver metricas y gestionar tu suscripcion desde Stripe."}
                        </p>
                    )}
                </div>

                {isUserPro || isSubscriptionInactive ? (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            void handleOpenUserPortal();
                        }}
                        disabled={createPortalMutation.isPending}
                        className="gap-2 w-full sm:w-auto bg-white hover:bg-gray-100"
                    >
                        <ExternalLink className="h-4 w-4" />
                        Gestionar suscripcion
                    </Button>
                ) : (
                    <Button
                        type="button"
                        onClick={() => {
                            void handleUpgradeToUserPro();
                        }}
                        disabled={createCheckoutMutation.isPending}
                        className="gap-2 w-full sm:w-auto"
                    >
                        {createCheckoutMutation.isPending ? "Redirigiendo..." : "Hazte User Pro"}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default UserSubscriptionSettingsCard;
