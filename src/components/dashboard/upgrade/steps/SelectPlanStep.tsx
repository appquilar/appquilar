
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { CompanyFormData } from '../UpgradePage';
import { cn } from '@/lib/utils';
import type { CompanyBillingPlanType } from "@/domain/models/Billing";

interface PlanOption {
  id: CompanyBillingPlanType;
  title: string;
  subtitle: string;
  price: string;
  priceUnit: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
}

interface SelectPlanStepProps {
  formData: CompanyFormData;
  onUpdateFormData: (data: Partial<CompanyFormData>) => void;
  onComplete: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const plans: PlanOption[] = [
  {
    id: 'starter',
    title: 'Starter',
    subtitle: 'Para empezar con tu negocio de alquiler',
    price: '€39',
    priceUnit: '/mes',
    features: [
      'Hasta 10 productos activos',
      'Analítica básica',
      'Subdominio empresa.appquilar.com'
    ],
    buttonText: 'Elegir Starter'
  },
  {
    id: 'pro',
    title: 'Pro',
    subtitle: 'Para equipos y mayor conversión',
    price: '€99',
    priceUnit: '/mes',
    features: [
      'Hasta 50 productos en catálogo',
      'Hasta 5 miembros de equipo',
      'Analítica avanzada y origen geográfico',
      'Dominio personalizado y branding'
    ],
    popular: true,
    buttonText: 'Elegir Pro'
  },
  {
    id: 'enterprise',
    title: 'Enterprise',
    subtitle: 'Escalado completo y API externa',
    price: '€249',
    priceUnit: '/mes',
    features: [
      'Productos ilimitados en catálogo',
      'Equipo ilimitado',
      'Analítica avanzada',
      'Soporte prioritario y acceso API'
    ],
    buttonText: 'Elegir Enterprise'
  }
];

const SelectPlanStep = ({ 
  formData, 
  onUpdateFormData, 
  onComplete, 
  onBack,
  isSubmitting 
}: SelectPlanStepProps) => {
  const [selectedPlan, setSelectedPlan] = useState<CompanyBillingPlanType>(
    formData.selectedPlan
  );

  const handleSelectPlan = (planId: CompanyBillingPlanType) => {
    setSelectedPlan(planId);
    onUpdateFormData({ selectedPlan: planId });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Selecciona tu Plan</h2>
        <p className="text-muted-foreground">Elige el plan que mejor se adapte a tus necesidades.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={cn(
              "border rounded-lg overflow-hidden transition-all cursor-pointer relative",
              selectedPlan === plan.id 
                ? "border-primary shadow-md" 
                : "border-border hover:border-primary/50",
              plan.popular && "md:scale-105" 
            )}
            onClick={() => handleSelectPlan(plan.id)}
          >
            {plan.popular && (
              <div className="absolute top-0 inset-x-0 bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                Más Popular
              </div>
            )}
            
            <div className={cn(
              "p-6", 
              plan.popular && "pt-9"
            )}>
              <h3 className="text-lg font-medium">{plan.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{plan.subtitle}</p>
              
              <div className="mb-4">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.priceUnit}</span>
              </div>
              
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                variant={selectedPlan === plan.id ? "default" : "outline"}
                className="w-full"
                type="button"
              >
                {plan.buttonText}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Volver
        </Button>
        <Button onClick={onComplete} disabled={isSubmitting}>
          {isSubmitting ? 'Procesando...' : 'Continuar al pago seguro'}
        </Button>
      </div>
    </div>
  );
};

export default SelectPlanStep;
