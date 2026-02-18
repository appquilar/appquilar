import { CreditCard, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import {
    useCreateCustomerPortalSession,
} from "@/application/hooks/useBilling";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ApiError } from "@/infrastructure/http/ApiClient";
import type { CompanyPlanType } from "@/domain/models/Subscription";

const COMPANY_PLAN_LABELS: Record<CompanyPlanType, string> = {
    starter: "Starter",
    pro: "Pro",
    enterprise: "Enterprise",
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

const CompanySubscriptionSettingsCard = () => {
    const { currentUser } = useAuth();
    const createPortalMutation = useCreateCustomerPortalSession();

    const companyContext = currentUser?.companyContext ?? null;
    const effectiveCompanyRole = companyContext?.companyRole ?? currentUser?.companyRole ?? null;
    const isCompanyAdmin = effectiveCompanyRole === "ROLE_ADMIN";
    if (!companyContext || !isCompanyAdmin) {
        return null;
    }

    const currentUrl = typeof window !== "undefined" ? window.location.href : "";
    const currentPlan: CompanyPlanType = companyContext.planType;

    const handleOpenCompanyPortal = async () => {
        const newTab = window.open("", "_blank");
        if (!newTab) {
            toast.error("No se pudo abrir una nueva pestana. Revisa el bloqueador de ventanas emergentes.");
            return;
        }
        newTab.opener = null;

        try {
            const response = await createPortalMutation.mutateAsync({
                scope: "company",
                returnUrl: currentUrl,
            });

            newTab.location.href = response.url;
        } catch (error) {
            newTab.close();
            console.error("Error creating company portal session", error);
            const backendError = extractBackendErrorMessage(error);
            toast.error(
                backendError ?? "No se pudo abrir el Customer Portal de la empresa."
            );
        }
    };

    const isSubmitting = createPortalMutation.isPending;

    return (
        <div className="rounded-md border p-4 bg-muted/10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Suscripcion de empresa
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge
                            variant="outline"
                            className="cursor-default bg-orange-200 text-orange-600 border-transparent"
                        >
                            {COMPANY_PLAN_LABELS[currentPlan] ?? currentPlan}
                        </Badge>
                        <Badge
                            variant="outline"
                            className={`cursor-default ${statusBadgeClass(companyContext.subscriptionStatus)}`}
                        >
                            {STATUS_LABELS[companyContext.subscriptionStatus] ?? companyContext.subscriptionStatus}
                        </Badge>
                        {companyContext.isFoundingAccount && (
                            <Badge
                                variant="outline"
                                className="cursor-default bg-sky-100 text-sky-700 border-sky-200"
                            >
                                Early Bird
                            </Badge>
                        )}
                    </div>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        void handleOpenCompanyPortal();
                    }}
                    disabled={isSubmitting}
                    className="gap-2 w-full sm:w-auto bg-white hover:bg-gray-100"
                >
                    <ExternalLink className="h-4 w-4" />
                    Gestionar suscripcion
                </Button>
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

export default CompanySubscriptionSettingsCard;
