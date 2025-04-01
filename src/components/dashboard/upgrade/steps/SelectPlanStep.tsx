
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { CompanyFormData } from '../UpgradePage';
import { cn } from '@/lib/utils';

interface PlanOption {
  id: 'basic' | 'professional' | 'premium';
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
    id: 'basic',
    title: 'Plan Básico',
    subtitle: 'Ideal para pequeños negocios',
    price: '€29',
    priceUnit: '/mes',
    features: [
      'Hasta 20 productos en catálogo',
      'Dashboard básico de gestión',
      'Soporte por email'
    ],
    buttonText: 'Comenzar Ahora'
  },
  {
    id: 'professional',
    title: 'Plan Profesional',
    subtitle: 'Para empresas en crecimiento',
    price: '€79',
    priceUnit: '/mes',
    features: [
      'Hasta 50 productos en catálogo',
      'Dashboard completo con estadísticas',
      'Soporte por email y teléfono',
      'Sistema de reservas avanzado',
      'Instalación de buscador de productos en tu propia web'
    ],
    popular: true,
    buttonText: 'Elegir Profesional'
  },
  {
    id: 'premium',
    title: 'Plan Premium',
    subtitle: 'Para grandes empresas',
    price: '€149',
    priceUnit: '/mes',
    features: [
      'Productos ilimitados en catálogo',
      'Dashboard completo con estadísticas',
      'Soporte prioritario',
      'Sistema de reservas avanzado',
      'Múltiples usuarios y perfiles',
      'Creación y mantenimiento de tu propia web'
    ],
    buttonText: 'Elegir Premium'
  }
];

const SelectPlanStep = ({ 
  formData, 
  onUpdateFormData, 
  onComplete, 
  onBack,
  isSubmitting 
}: SelectPlanStepProps) => {
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'professional' | 'premium'>(
    formData.selectedPlan
  );

  const handleSelectPlan = (planId: 'basic' | 'professional' | 'premium') => {
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
          {isSubmitting ? 'Procesando...' : 'Completar Registro'}
        </Button>
      </div>
    </div>
  );
};

export default SelectPlanStep;
