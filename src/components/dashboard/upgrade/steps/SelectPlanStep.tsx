import { useEffect, useMemo, useState } from "react";
import { Check, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePaymentPlans } from "@/application/hooks/usePaymentPlans";
import { cn } from "@/lib/utils";
import type { CompanyBillingPlanType } from "@/domain/models/Billing";
import type { PaymentPlan } from "@/domain/models/PaymentPlan";
import { CompanyFormData } from "../UpgradePage";

interface SelectPlanStepProps {
  formData: CompanyFormData;
  onUpdateFormData: (data: Partial<CompanyFormData>) => void;
  onComplete: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const formatPrice = (plan: PaymentPlan): string => {
  if (typeof plan.price.amount !== "number") {
    return "Precio a medida";
  }

  const currency = (plan.price.currency ?? "EUR").toUpperCase();

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(plan.price.amount / 100);
};

const SelectPlanStep = ({
  formData,
  onUpdateFormData,
  onComplete,
  onBack,
  isSubmitting,
}: SelectPlanStepProps) => {
  const paymentPlansQuery = usePaymentPlans("company", { checkoutOnly: true });
  const checkoutPlans = useMemo(
    () => (paymentPlansQuery.data ?? []) as PaymentPlan[],
    [paymentPlansQuery.data]
  );
  const [selectedPlan, setSelectedPlan] = useState<CompanyBillingPlanType>(
    formData.selectedPlan
  );

  useEffect(() => {
    if (checkoutPlans.length === 0) {
      return;
    }

    const currentPlanStillExists = checkoutPlans.some(
      (plan) => plan.planCode === selectedPlan
    );

    if (currentPlanStillExists) {
      return;
    }

    const fallbackPlan = checkoutPlans[0]?.planCode as CompanyBillingPlanType | undefined;
    if (!fallbackPlan) {
      return;
    }

    setSelectedPlan(fallbackPlan);
    onUpdateFormData({ selectedPlan: fallbackPlan });
  }, [checkoutPlans, onUpdateFormData, selectedPlan]);

  const handleSelectPlan = (planId: CompanyBillingPlanType) => {
    setSelectedPlan(planId);
    onUpdateFormData({ selectedPlan: planId });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Selecciona tu Plan</h2>
        <p className="text-muted-foreground">
          Estos planes ya salen del catálogo administrable, así que verás exactamente lo que está activo en panel.
        </p>
      </div>

      {paymentPlansQuery.isLoading && (
        <div className="rounded-lg border border-border bg-muted/20 p-8 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Cargando planes disponibles...</p>
        </div>
      )}

      {paymentPlansQuery.isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5">
          <p className="text-sm text-destructive">
            No se pudo cargar el catálogo de planes ahora mismo.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-3 gap-2"
            onClick={() => {
              void paymentPlansQuery.refetch();
            }}
          >
            <RotateCcw className="h-4 w-4" />
            Reintentar
          </Button>
        </div>
      )}

      {!paymentPlansQuery.isLoading && !paymentPlansQuery.isError && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {checkoutPlans.map((plan) => {
            const planId = plan.planCode as CompanyBillingPlanType;
            const isSelected = selectedPlan === planId;
            const badge = plan.badgeText ?? (planId === "pro" ? "Mas popular" : null);

            return (
              <div
                key={plan.planCode}
                className={cn(
                  "relative cursor-pointer overflow-hidden rounded-xl border bg-card transition-all",
                  isSelected ? "border-primary shadow-md" : "border-border hover:border-primary/50"
                )}
                onClick={() => handleSelectPlan(planId)}
              >
                {badge && (
                  <div className="absolute inset-x-0 top-0 bg-primary py-1 text-center text-sm font-medium text-primary-foreground">
                    {badge}
                  </div>
                )}

                <div className={cn("p-6", badge && "pt-9")}>
                  <h3 className="text-lg font-medium">{plan.displayName}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.subtitle ?? "Plan configurable desde administración."}</p>
                  {plan.marketingMessage && (
                    <p className="mt-2 text-xs font-medium uppercase tracking-wide text-primary">
                      {plan.marketingMessage}
                    </p>
                  )}

                  <div className="mb-4 mt-4">
                    <span className="text-3xl font-bold">{formatPrice(plan)}</span>
                    <span className="text-muted-foreground">
                      {plan.price.interval === "month" ? "/mes" : ""}
                    </span>
                  </div>

                  <ul className="mb-6 space-y-2">
                    {plan.featureList.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 shrink-0 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={isSelected ? "default" : "outline"}
                    className="w-full"
                    type="button"
                  >
                    {isSelected ? "Plan seleccionado" : `Elegir ${plan.displayName}`}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Volver
        </Button>
        <Button
          onClick={onComplete}
          disabled={
            isSubmitting ||
            paymentPlansQuery.isLoading ||
            paymentPlansQuery.isError ||
            checkoutPlans.length === 0
          }
        >
          {isSubmitting ? "Procesando..." : "Continuar al pago seguro"}
        </Button>
      </div>
    </div>
  );
};

export default SelectPlanStep;
