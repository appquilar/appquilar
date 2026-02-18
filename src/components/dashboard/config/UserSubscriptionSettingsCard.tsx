import { CreditCard, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import {
    useCreateCheckoutSession,
    useCreateCustomerPortalSession,
} from "@/application/hooks/useBilling";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ApiError } from "@/infrastructure/http/ApiClient";
import type { UserPlanType } from "@/domain/models/Subscription";

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
    const { currentUser } = useAuth();
    const createPortalMutation = useCreateCustomerPortalSession();
    const createCheckoutMutation = useCreateCheckoutSession();

    const hasCompanyProfile = Boolean(
        currentUser?.companyContext?.companyId ?? currentUser?.companyId
    );

    if (!currentUser || hasCompanyProfile) {
        return null;
    }

    const currentUrl = typeof window !== "undefined" ? window.location.href : "";
    const currentPlan: UserPlanType = currentUser.planType ?? "explorer";
    const isUserPro = currentPlan === "user_pro";
    const currentStatus = currentUser.subscriptionStatus ?? "active";

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
                returnUrl: currentUrl,
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
                successUrl: currentUrl,
                cancelUrl: currentUrl,
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
                            {USER_PLAN_LABELS[currentPlan] ?? currentPlan}
                        </Badge>
                        {isUserPro ? (
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
                            Activa User Pro para ver metricas y gestionar tu suscripcion desde Stripe.
                        </p>
                    )}
                </div>

                {isUserPro ? (
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

const extractBackendErrorMessage = (error: unknown): string | null => {
    if (!(error instanceof ApiError)) {
        return null;
    }

    const payload = error.payload as { error?: unknown } | undefined;
    const backendError = payload?.error;

    if (Array.isArray(backendError) && typeof backendError[0] === "string") {
        return backendError[0];
    }

    if (typeof backendError === "string") {
        return backendError;
    }

    return null;
};

export default UserSubscriptionSettingsCard;
