import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CreditCard, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import {
    useCreateCustomerPortalSession,
    useMigrateCompanyToExplorer,
} from "@/application/hooks/useBilling";
import { useCompanyUsers } from "@/application/hooks/useCompanyMembership";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    const { currentUser, refreshCurrentUser } = useAuth();
    const createPortalMutation = useCreateCustomerPortalSession();
    const migrateCompanyMutation = useMigrateCompanyToExplorer();

    const companyContext = currentUser?.companyContext ?? null;
    const effectiveCompanyRole = companyContext?.companyRole ?? currentUser?.companyRole ?? null;
    const isCompanyAdmin = effectiveCompanyRole === "ROLE_ADMIN";
    if (!companyContext || !isCompanyAdmin) {
        return null;
    }

    const companyUsersQuery = useCompanyUsers(companyContext.companyId, 1, 200);
    const ownerCandidates = useMemo(
        () =>
            (companyUsersQuery.data ?? []).filter(
                (user) =>
                    user.role === "ROLE_ADMIN" &&
                    user.status === "ACCEPTED" &&
                    typeof user.userId === "string" &&
                    user.userId.length > 0
            ),
        [companyUsersQuery.data]
    );
    const requiresOwnerSelection = ownerCandidates.length > 1;
    const defaultOwnerCandidate = ownerCandidates[0]?.userId ?? "";
    const [targetOwnerUserId, setTargetOwnerUserId] = useState<string>(defaultOwnerCandidate);

    useEffect(() => {
        if (!targetOwnerUserId && defaultOwnerCandidate) {
            setTargetOwnerUserId(defaultOwnerCandidate);
        }
    }, [defaultOwnerCandidate, targetOwnerUserId]);

    const currentUrl = typeof window !== "undefined" ? window.location.href : "";
    const currentPlan: CompanyPlanType = companyContext.planType;
    const isSubscriptionInactive = companyContext.subscriptionStatus !== "active";
    const isPaused = companyContext.subscriptionStatus === "paused";

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

    const handleMigrateToExplorer = async () => {
        const selectedOwner = targetOwnerUserId || defaultOwnerCandidate;
        if (requiresOwnerSelection && !selectedOwner) {
            toast.error("Selecciona el usuario que conservara la propiedad.");
            return;
        }

        const confirmed = window.confirm(
            "Esta accion no se puede deshacer. Se eliminara la empresa y se migraran productos y alquileres al usuario seleccionado."
        );

        if (!confirmed) {
            return;
        }

        try {
            await migrateCompanyMutation.mutateAsync({
                targetOwnerUserId: selectedOwner || null,
                confirm: true,
            });

            await refreshCurrentUser();
            toast.success("Empresa migrada a modo Explorador.");
            window.location.assign("/dashboard/config");
        } catch (error) {
            console.error("Error migrating company to explorer", error);
            const backendError = extractBackendErrorMessage(error);
            toast.error(backendError ?? "No se pudo completar la migracion a Explorador.");
        }
    };

    const isSubmitting = createPortalMutation.isPending;
    const isMigrating = migrateCompanyMutation.isPending;

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

            {isSubscriptionInactive && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-2 text-amber-900">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        <div className="space-y-2 text-sm">
                            <p className="font-semibold">
                                {isPaused
                                    ? "Hay un problema con el cobro de la suscripcion"
                                    : "La suscripcion de empresa esta cancelada"}
                            </p>
                            <p>
                                {isPaused
                                    ? "Stripe esta reintentando el cobro. Puedes resolver el pago desde el portal o migrar a un perfil Explorador."
                                    : "Puedes migrar a un perfil de usuario Explorador. Esta accion movera productos y alquileres a un unico administrador y eliminara la empresa. No se puede deshacer."}
                            </p>
                        </div>
                    </div>

                    <div className="mt-3 space-y-3">
                        {requiresOwnerSelection && (
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-slate-700">
                                    Usuario que conservara la propiedad
                                </p>
                                <Select
                                    value={targetOwnerUserId}
                                    onValueChange={setTargetOwnerUserId}
                                >
                                    <SelectTrigger className="w-full bg-white">
                                        <SelectValue placeholder="Selecciona administrador" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ownerCandidates.map((candidate) => (
                                            <SelectItem key={candidate.userId!} value={candidate.userId!}>
                                                {candidate.email}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    void handleMigrateToExplorer();
                                }}
                                disabled={
                                    isMigrating ||
                                    companyUsersQuery.isLoading ||
                                    ownerCandidates.length === 0 ||
                                    (requiresOwnerSelection && !targetOwnerUserId)
                                }
                                className="bg-white hover:bg-slate-100"
                            >
                                Migrar a Explorador
                            </Button>
                        </div>
                    </div>
                </div>
            )}
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
