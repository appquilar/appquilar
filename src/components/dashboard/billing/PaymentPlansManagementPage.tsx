import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { CreditCard, RotateCcw, Save, Users } from "lucide-react";
import { toast } from "sonner";

import DashboardSectionHeader from "@/components/dashboard/common/DashboardSectionHeader";
import DataTable from "@/components/dashboard/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
    useAssignPaymentPlan,
    usePaymentPlans,
    usePaymentPlanSubscribers,
    useUpdatePaymentPlan,
} from "@/application/hooks/usePaymentPlans";
import type {
    PaymentPlan,
    PaymentPlanScope,
    PaymentPlanSubscriber,
} from "@/domain/models/PaymentPlan";
import type { FeatureCapabilities } from "@/domain/models/Subscription";
import { cn } from "@/lib/utils";
import { extractBackendErrorMessage } from "@/utils/backendError";

interface PlanEditorFormValues {
    displayName: string;
    subtitle: string;
    marketingMessage: string;
    badgeText: string;
    featureListText: string;
    activeProducts: string;
    teamMembers: string;
    sortOrder: string;
    priceAmountEuros: string;
    priceCurrency: string;
    priceInterval: string;
    stripeProductId: string;
    isActive: boolean;
    isVisibleInCheckout: boolean;
    isCheckoutEnabled: boolean;
    isManualAssignmentEnabled: boolean;
    basicAnalytics: boolean;
    advancedAnalytics: boolean;
    inventoryManagement: boolean;
    teamManagement: boolean;
    apiAccess: boolean;
}

interface AssignPlanFormValues {
    targetId: string;
    subscriptionStatus: "active" | "paused" | "canceled";
}

const PLAN_SCOPE_LABELS: Record<PaymentPlanScope, string> = {
    user: "Usuario",
    company: "Empresa",
};

const capabilityLabelEntries: Array<{
    key: keyof Pick<
        PlanEditorFormValues,
        "basicAnalytics" | "advancedAnalytics" | "inventoryManagement" | "teamManagement" | "apiAccess"
    >;
    label: string;
    description: string;
}> = [
    {
        key: "basicAnalytics",
        label: "Analítica básica",
        description: "La misma capa ligera de métricas que recibe User Pro.",
    },
    {
        key: "advancedAnalytics",
        label: "Analítica avanzada",
        description: "Desbloquea profundidad extra para empresa y panel.",
    },
    {
        key: "inventoryManagement",
        label: "Gestión de inventario",
        description: "Habilita stock, reservas y cantidades por producto.",
    },
    {
        key: "teamManagement",
        label: "Gestión de miembros",
        description: "Permite administrar miembros según la cuota configurada.",
    },
    {
        key: "apiAccess",
        label: "Web Appquilar gestionada",
        description: "Etiqueta comercial de la capability técnica api_access.",
    },
];

const buildPlanFormValues = (plan: PaymentPlan): PlanEditorFormValues => ({
    displayName: plan.displayName,
    subtitle: plan.subtitle ?? "",
    marketingMessage: plan.marketingMessage ?? "",
    badgeText: plan.badgeText ?? "",
    featureListText: plan.featureList.join("\n"),
    activeProducts:
        typeof plan.quotas.activeProducts === "number"
            ? String(plan.quotas.activeProducts)
            : "",
    teamMembers:
        typeof plan.quotas.teamMembers === "number"
            ? String(plan.quotas.teamMembers)
            : "",
    sortOrder: String(plan.sortOrder),
    priceAmountEuros:
        typeof plan.price.amount === "number"
            ? (plan.price.amount / 100).toString()
            : "",
    priceCurrency: plan.price.currency ?? "eur",
    priceInterval: plan.price.interval ?? "month",
    stripeProductId: plan.price.stripeProductId ?? "",
    isActive: plan.isActive,
    isVisibleInCheckout: plan.isVisibleInCheckout,
    isCheckoutEnabled: plan.isCheckoutEnabled,
    isManualAssignmentEnabled: plan.isManualAssignmentEnabled,
    basicAnalytics: plan.capabilities.basicAnalytics?.state === "enabled",
    advancedAnalytics: plan.capabilities.advancedAnalytics?.state === "enabled",
    inventoryManagement: plan.capabilities.inventoryManagement?.state === "enabled",
    teamManagement: plan.capabilities.teamManagement?.state === "enabled",
    apiAccess: plan.capabilities.apiAccess?.state === "enabled",
});

const buildDefaultCapabilities = (
    values: PlanEditorFormValues,
    plan: PaymentPlan
): FeatureCapabilities => ({
    inventoryManagement: {
        state: values.inventoryManagement ? "enabled" : "disabled",
        limits: values.inventoryManagement
            ? {
                  maxProductsWithInventory:
                      plan.capabilities.inventoryManagement?.limits.maxProductsWithInventory ?? null,
                  maxQuantityPerProduct:
                      plan.capabilities.inventoryManagement?.limits.maxQuantityPerProduct ?? null,
              }
            : {
                  maxProductsWithInventory: 0,
                  maxQuantityPerProduct: 1,
              },
    },
    basicAnalytics: {
        state: values.basicAnalytics ? "enabled" : "disabled",
        limits: plan.capabilities.basicAnalytics?.limits ?? null,
    },
    advancedAnalytics: {
        state: values.advancedAnalytics ? "enabled" : "disabled",
        limits: plan.capabilities.advancedAnalytics?.limits ?? null,
    },
    teamManagement: {
        state: values.teamManagement ? "enabled" : "disabled",
        limits: {
            team_members:
                values.teamMembers.trim() === ""
                    ? null
                    : Number(values.teamMembers.trim()),
        },
    },
    apiAccess: {
        state: values.apiAccess ? "enabled" : "disabled",
        limits: plan.capabilities.apiAccess?.limits ?? null,
    },
});

const formatPrice = (plan: PaymentPlan): string => {
    if (typeof plan.price.amount !== "number") {
        return "Sin precio";
    }

    return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: (plan.price.currency ?? "EUR").toUpperCase(),
    }).format(plan.price.amount / 100);
};

const statusBadgeClass = (status: string): string => {
    switch (status) {
        case "active":
            return "bg-emerald-100 text-emerald-700 border-emerald-200";
        case "paused":
            return "bg-amber-100 text-amber-700 border-amber-200";
        default:
            return "bg-rose-100 text-rose-700 border-rose-200";
    }
};

const renderFieldError = (message?: string) =>
    message ? <p className="mt-1 text-xs text-destructive">{message}</p> : null;

const PaymentPlansManagementPage = () => {
    const [scope, setScope] = useState<PaymentPlanScope>("company");
    const [selectedPlanCode, setSelectedPlanCode] = useState<string | null>(null);
    const plansQuery = usePaymentPlans(scope);
    const updatePlanMutation = useUpdatePaymentPlan();
    const assignPlanMutation = useAssignPaymentPlan();

    const plans = useMemo<PaymentPlan[]>(() => plansQuery.data ?? [], [plansQuery.data]);
    const selectedPlan = useMemo(
        () => plans.find((plan) => plan.planCode === selectedPlanCode) ?? null,
        [plans, selectedPlanCode]
    );

    const subscribersQuery = usePaymentPlanSubscribers(
        scope,
        selectedPlan?.planCode ?? null,
        Boolean(selectedPlan)
    );

    const planForm = useForm<PlanEditorFormValues>({
        defaultValues: {
            displayName: "",
            subtitle: "",
            marketingMessage: "",
            badgeText: "",
            featureListText: "",
            activeProducts: "",
            teamMembers: "",
            sortOrder: "0",
            priceAmountEuros: "",
            priceCurrency: "eur",
            priceInterval: "month",
            stripeProductId: "",
            isActive: true,
            isVisibleInCheckout: false,
            isCheckoutEnabled: false,
            isManualAssignmentEnabled: false,
            basicAnalytics: false,
            advancedAnalytics: false,
            inventoryManagement: false,
            teamManagement: false,
            apiAccess: false,
        },
    });

    const assignForm = useForm<AssignPlanFormValues>({
        defaultValues: {
            targetId: "",
            subscriptionStatus: "active",
        },
    });

    useEffect(() => {
        if (plans.length === 0) {
            setSelectedPlanCode(null);
            return;
        }

        const existingPlan = plans.some((plan) => plan.planCode === selectedPlanCode);
        if (!existingPlan) {
            setSelectedPlanCode(plans[0].planCode);
        }
    }, [plans, selectedPlanCode]);

    useEffect(() => {
        if (!selectedPlan) {
            return;
        }

        planForm.reset(buildPlanFormValues(selectedPlan));
    }, [planForm, selectedPlan]);

    const subscriberColumns = useMemo(
        () => [
            {
                key: "name",
                header: "Suscriptor",
                cell: (subscriber: PaymentPlanSubscriber) => (
                    <div>
                        <p className="font-medium text-slate-900">
                            {subscriber.name ??
                                ([subscriber.firstName, subscriber.lastName].filter(Boolean).join(" ") ||
                                    subscriber.email ||
                                    subscriber.contactEmail ||
                                    subscriber.id)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {subscriber.email ?? subscriber.contactEmail ?? subscriber.slug ?? subscriber.id}
                        </p>
                    </div>
                ),
            },
            {
                key: "planType",
                header: "Plan",
                cell: (subscriber: PaymentPlanSubscriber) => subscriber.planType,
            },
            {
                key: "subscriptionStatus",
                header: "Estado",
                cell: (subscriber: PaymentPlanSubscriber) => (
                    <Badge className={statusBadgeClass(subscriber.subscriptionStatus)}>
                        {subscriber.subscriptionStatus}
                    </Badge>
                ),
            },
        ],
        []
    );

    const handleSave = planForm.handleSubmit(async (values) => {
        if (!selectedPlan) {
            return;
        }

        const parsedSortOrder = Number(values.sortOrder);
        if (!Number.isFinite(parsedSortOrder)) {
            planForm.setError("sortOrder", {
                type: "validate",
                message: "El orden debe ser un numero valido.",
            });
            return;
        }

        let priceAmount: number | null = null;
        if (values.priceAmountEuros.trim() !== "") {
            const parsedPrice = Number(values.priceAmountEuros.replace(",", "."));
            if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
                planForm.setError("priceAmountEuros", {
                    type: "validate",
                    message: "Introduce un precio mensual valido.",
                });
                return;
            }

            priceAmount = Math.round(parsedPrice * 100);
        }

        const activeProducts =
            values.activeProducts.trim() === "" ? null : Number(values.activeProducts);
        if (values.activeProducts.trim() !== "" && !Number.isFinite(activeProducts)) {
            planForm.setError("activeProducts", {
                type: "validate",
                message: "La cuota de productos debe ser numerica.",
            });
            return;
        }

        const teamMembers =
            values.teamMembers.trim() === "" ? null : Number(values.teamMembers);
        if (values.teamMembers.trim() !== "" && !Number.isFinite(teamMembers)) {
            planForm.setError("teamMembers", {
                type: "validate",
                message: "La cuota de miembros debe ser numerica.",
            });
            return;
        }

        try {
            await updatePlanMutation.mutateAsync({
                scope,
                planCode: selectedPlan.planCode,
                displayName: values.displayName.trim(),
                subtitle: values.subtitle.trim() || null,
                marketingMessage: values.marketingMessage.trim() || null,
                badgeText: values.badgeText.trim() || null,
                featureList: values.featureListText
                    .split("\n")
                    .map((line) => line.trim())
                    .filter((line) => line.length > 0),
                quotas: {
                    activeProducts,
                    teamMembers,
                },
                capabilities: buildDefaultCapabilities(values, selectedPlan),
                sortOrder: parsedSortOrder,
                isActive: values.isActive,
                isVisibleInCheckout: values.isVisibleInCheckout,
                isCheckoutEnabled: values.isCheckoutEnabled,
                isManualAssignmentEnabled: values.isManualAssignmentEnabled,
                priceAmount,
                priceCurrency: priceAmount === null ? null : values.priceCurrency.trim().toLowerCase(),
                priceInterval: priceAmount === null ? null : values.priceInterval.trim().toLowerCase(),
                stripeProductId: values.stripeProductId.trim() || null,
            });
            toast.success("Plan actualizado.");
            await plansQuery.refetch();
        } catch (error) {
            const backendError = extractBackendErrorMessage(error);
            toast.error(backendError ?? "No se pudo actualizar el plan.");
        }
    });

    const handleAssign = assignForm.handleSubmit(async (values) => {
        if (!selectedPlan) {
            return;
        }

        try {
            await assignPlanMutation.mutateAsync({
                scope,
                planCode: selectedPlan.planCode,
                targetId: values.targetId.trim(),
                subscriptionStatus: values.subscriptionStatus,
            });
            toast.success("Plan asignado manualmente.");
            assignForm.reset({
                targetId: "",
                subscriptionStatus: values.subscriptionStatus,
            });
        } catch (error) {
            const backendError = extractBackendErrorMessage(error);
            toast.error(backendError ?? "No se pudo asignar el plan.");
        }
    });

    return (
        <div className="space-y-6">
            <DashboardSectionHeader
                title="Planes de pago"
                description="Catálogo administrable para usuario y empresa, con pricing, features, cuotas y suscriptores."
                icon={CreditCard}
                actions={
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => {
                            void plansQuery.refetch();
                            void subscribersQuery.refetch();
                        }}
                    >
                        <RotateCcw size={16} />
                        Recargar
                    </Button>
                }
            />

            <Tabs
                value={scope}
                onValueChange={(value) => {
                    setScope(value as PaymentPlanScope);
                }}
            >
                <TabsList>
                    <TabsTrigger value="user">Usuario</TabsTrigger>
                    <TabsTrigger value="company">Empresa</TabsTrigger>
                </TabsList>

                <TabsContent value={scope} className="space-y-6">
                    {plansQuery.isLoading && (
                        <div className="flex justify-center rounded-md border p-8">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                        </div>
                    )}

                    {plansQuery.isError && (
                        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4">
                            <p className="text-sm text-destructive">
                                No se pudo cargar el catálogo de {PLAN_SCOPE_LABELS[scope].toLowerCase()}.
                            </p>
                        </div>
                    )}

                    {!plansQuery.isLoading && !plansQuery.isError && (
                        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.4fr)]">
                            <div className="space-y-4">
                                <div className="rounded-xl border bg-white p-4">
                                    <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                                        Planes {PLAN_SCOPE_LABELS[scope].toLowerCase()}
                                    </h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Selecciona un plan para editar configuración, precio y asignación manual.
                                    </p>
                                </div>

                                {plans.length === 0 ? (
                                    <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
                                        No hay planes configurados.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {plans.map((plan) => {
                                            const isSelected = selectedPlanCode === plan.planCode;

                                            return (
                                                <button
                                                    key={plan.planCode}
                                                    type="button"
                                                    aria-pressed={isSelected}
                                                    onClick={() => setSelectedPlanCode(plan.planCode)}
                                                    className={cn(
                                                        "w-full rounded-xl border p-4 text-left transition-colors",
                                                        isSelected
                                                            ? "border-primary bg-primary/5 shadow-sm"
                                                            : "border-border bg-white hover:border-primary/40 hover:bg-slate-50"
                                                    )}
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <p className="font-medium text-slate-900">{plan.displayName}</p>
                                                            <p className="text-xs text-muted-foreground">{plan.planCode}</p>
                                                        </div>
                                                        <Badge variant={isSelected ? "default" : "outline"}>
                                                            {plan.isCheckoutEnabled ? "Checkout activo" : "Checkout pausado"}
                                                        </Badge>
                                                    </div>
                                                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                                                        <p className="text-slate-900">{formatPrice(plan)}</p>
                                                        <p className="text-muted-foreground">
                                                            {plan.featureList[0] ?? "Sin features visibles"}
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                {!selectedPlan && (
                                    <div className="rounded-xl border bg-white p-6 text-sm text-muted-foreground">
                                        Selecciona un plan para empezar a editarlo.
                                    </div>
                                )}

                                {selectedPlan && (
                                    <>
                                        <form
                                            onSubmit={(event) => {
                                                void handleSave(event);
                                            }}
                                            className="space-y-5 rounded-xl border bg-white p-6"
                                        >
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div>
                                                    <h2 className="text-xl font-semibold text-slate-900">
                                                        {selectedPlan.displayName}
                                                    </h2>
                                                    <p className="text-sm text-muted-foreground">
                                                        Codigo técnico: <span className="font-mono">{selectedPlan.planCode}</span>
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <Badge variant="outline">{PLAN_SCOPE_LABELS[selectedPlan.scope]}</Badge>
                                                    {selectedPlan.badgeText && (
                                                        <Badge variant="outline">{selectedPlan.badgeText}</Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div>
                                                    <Label htmlFor="displayName">Nombre visible</Label>
                                                    <Input
                                                        id="displayName"
                                                        {...planForm.register("displayName", {
                                                            required: "El nombre visible es obligatorio.",
                                                        })}
                                                    />
                                                    {renderFieldError(planForm.formState.errors.displayName?.message)}
                                                </div>
                                                <div>
                                                    <Label htmlFor="badgeText">Badge</Label>
                                                    <Input id="badgeText" {...planForm.register("badgeText")} />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Label htmlFor="subtitle">Subtítulo</Label>
                                                    <Input id="subtitle" {...planForm.register("subtitle")} />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Label htmlFor="marketingMessage">Mensaje comercial</Label>
                                                    <Input
                                                        id="marketingMessage"
                                                        {...planForm.register("marketingMessage")}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="sortOrder">Orden</Label>
                                                    <Input id="sortOrder" {...planForm.register("sortOrder")} />
                                                    {renderFieldError(planForm.formState.errors.sortOrder?.message)}
                                                </div>
                                                <div>
                                                    <Label htmlFor="priceAmountEuros">Precio mensual (EUR)</Label>
                                                    <Input
                                                        id="priceAmountEuros"
                                                        placeholder="39"
                                                        {...planForm.register("priceAmountEuros")}
                                                    />
                                                    {renderFieldError(planForm.formState.errors.priceAmountEuros?.message)}
                                                </div>
                                                <div>
                                                    <Label htmlFor="activeProducts">Productos activos</Label>
                                                    <Input
                                                        id="activeProducts"
                                                        placeholder="10 o vacio para ilimitado"
                                                        {...planForm.register("activeProducts")}
                                                    />
                                                    {renderFieldError(planForm.formState.errors.activeProducts?.message)}
                                                </div>
                                                <div>
                                                    <Label htmlFor="teamMembers">Miembros de equipo</Label>
                                                    <Input
                                                        id="teamMembers"
                                                        placeholder="1 o vacio para ilimitado"
                                                        {...planForm.register("teamMembers")}
                                                    />
                                                    {renderFieldError(planForm.formState.errors.teamMembers?.message)}
                                                </div>
                                                <div>
                                                    <Label htmlFor="priceCurrency">Moneda</Label>
                                                    <Input id="priceCurrency" {...planForm.register("priceCurrency")} />
                                                </div>
                                                <div>
                                                    <Label htmlFor="priceInterval">Intervalo</Label>
                                                    <Input id="priceInterval" {...planForm.register("priceInterval")} />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Label htmlFor="stripeProductId">Stripe product ID</Label>
                                                    <Input
                                                        id="stripeProductId"
                                                        placeholder="prod_xxx"
                                                        {...planForm.register("stripeProductId")}
                                                    />
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        Si lo dejas vacío, Stripe creará el producto automáticamente al rotar el precio.
                                                    </p>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Label htmlFor="featureListText">Features visibles</Label>
                                                    <Textarea
                                                        id="featureListText"
                                                        rows={6}
                                                        placeholder="Una feature por línea"
                                                        {...planForm.register("featureListText")}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid gap-3 md:grid-cols-2">
                                                <Controller
                                                    control={planForm.control}
                                                    name="isActive"
                                                    render={({ field }) => (
                                                        <div className="flex items-center justify-between rounded-lg border p-3">
                                                            <div>
                                                                <p className="font-medium">Plan activo</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Desactiva por completo el plan.
                                                                </p>
                                                            </div>
                                                            <Switch
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </div>
                                                    )}
                                                />
                                                <Controller
                                                    control={planForm.control}
                                                    name="isVisibleInCheckout"
                                                    render={({ field }) => (
                                                        <div className="flex items-center justify-between rounded-lg border p-3">
                                                            <div>
                                                                <p className="font-medium">Visible en checkout</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Decide si se enseña en la selección comercial.
                                                                </p>
                                                            </div>
                                                            <Switch
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </div>
                                                    )}
                                                />
                                                <Controller
                                                    control={planForm.control}
                                                    name="isCheckoutEnabled"
                                                    render={({ field }) => (
                                                        <div className="flex items-center justify-between rounded-lg border p-3">
                                                            <div>
                                                                <p className="font-medium">Checkout habilitado</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Permite contratación self-service.
                                                                </p>
                                                            </div>
                                                            <Switch
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </div>
                                                    )}
                                                />
                                                <Controller
                                                    control={planForm.control}
                                                    name="isManualAssignmentEnabled"
                                                    render={({ field }) => (
                                                        <div className="flex items-center justify-between rounded-lg border p-3">
                                                            <div>
                                                                <p className="font-medium">Asignación manual</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Permite mover usuarios o empresas a este plan.
                                                                </p>
                                                            </div>
                                                            <Switch
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </div>
                                                    )}
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <div>
                                                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                        Features activables
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Custom domain y branding quedan retiradas: no se muestran aquí y se siguen enviando desactivadas por compatibilidad.
                                                    </p>
                                                </div>
                                                <div className="grid gap-3 md:grid-cols-2">
                                                    {capabilityLabelEntries.map((entry) => (
                                                        <Controller
                                                            key={entry.key}
                                                            control={planForm.control}
                                                            name={entry.key}
                                                            render={({ field }) => (
                                                                <div className="flex items-center justify-between rounded-lg border p-3">
                                                                    <div className="pr-4">
                                                                        <p className="font-medium">{entry.label}</p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {entry.description}
                                                                        </p>
                                                                    </div>
                                                                    <Switch
                                                                        checked={field.value}
                                                                        onCheckedChange={field.onChange}
                                                                    />
                                                                </div>
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="rounded-lg border bg-muted/20 p-4 text-xs text-muted-foreground">
                                                <p>Stripe product: {selectedPlan.price.stripeProductId ?? "sin configurar"}</p>
                                                <p>Stripe price: {selectedPlan.price.stripePriceId ?? "sin configurar"}</p>
                                                <p>Version de precio: {selectedPlan.price.version}</p>
                                            </div>

                                            <div className="flex justify-end">
                                                <Button
                                                    type="submit"
                                                    className="gap-2"
                                                    disabled={updatePlanMutation.isPending}
                                                >
                                                    <Save size={16} />
                                                    {updatePlanMutation.isPending ? "Guardando..." : "Guardar cambios"}
                                                </Button>
                                            </div>
                                        </form>

                                        <form
                                            onSubmit={(event) => {
                                                void handleAssign(event);
                                            }}
                                            className="space-y-4 rounded-xl border bg-white p-6"
                                        >
                                            <div>
                                                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                    Asignación manual
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Mueve directamente un usuario o empresa al plan seleccionado usando su UUID.
                                                </p>
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_auto]">
                                                <div>
                                                    <Label htmlFor="targetId">UUID objetivo</Label>
                                                    <Input
                                                        id="targetId"
                                                        placeholder="UUID de usuario o empresa"
                                                        {...assignForm.register("targetId", {
                                                            required: "El UUID objetivo es obligatorio.",
                                                        })}
                                                    />
                                                    {renderFieldError(assignForm.formState.errors.targetId?.message)}
                                                </div>
                                                <div>
                                                    <Label htmlFor="subscriptionStatus">Estado</Label>
                                                    <Controller
                                                        control={assignForm.control}
                                                        name="subscriptionStatus"
                                                        render={({ field }) => (
                                                            <select
                                                                id="subscriptionStatus"
                                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                                value={field.value}
                                                                onChange={field.onChange}
                                                            >
                                                                <option value="active">active</option>
                                                                <option value="paused">paused</option>
                                                                <option value="canceled">canceled</option>
                                                            </select>
                                                        )}
                                                    />
                                                </div>
                                                <div className="flex items-end">
                                                    <Button
                                                        type="submit"
                                                        disabled={assignPlanMutation.isPending}
                                                        className="w-full"
                                                    >
                                                        {assignPlanMutation.isPending ? "Asignando..." : "Asignar"}
                                                    </Button>
                                                </div>
                                            </div>
                                        </form>

                                        <section className="space-y-4 rounded-xl border bg-white p-6">
                                            <div className="flex items-center gap-2">
                                                <Users size={18} className="text-primary" />
                                                <div>
                                                    <h3 className="text-lg font-semibold text-slate-900">
                                                        Suscriptores del plan
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Quien está actualmente en {selectedPlan.displayName}.
                                                    </p>
                                                </div>
                                            </div>

                                            {subscribersQuery.isLoading && (
                                                <div className="flex justify-center p-6">
                                                    <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                                                </div>
                                            )}

                                            {subscribersQuery.isError && (
                                                <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                                                    No se pudo cargar el listado de suscriptores.
                                                </div>
                                            )}

                                            {!subscribersQuery.isLoading && !subscribersQuery.isError && (
                                                <DataTable<PaymentPlanSubscriber>
                                                    data={subscribersQuery.data ?? []}
                                                    columns={subscriberColumns}
                                                    emptyMessage="No hay suscriptores en este plan"
                                                />
                                            )}
                                        </section>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default PaymentPlansManagementPage;
