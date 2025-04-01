
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

// Wizard Steps
import CompanyInfoStep from './steps/CompanyInfoStep';
import ContactInfoStep from './steps/ContactInfoStep';
import SelectPlanStep from './steps/SelectPlanStep';
import SuccessStep from './steps/SuccessStep';

// Step types
export type StepId = 'company-info' | 'contact-info' | 'select-plan' | 'success';

export interface WizardStep {
  id: StepId;
  title: string;
}

// Form data type
export interface CompanyUpgradeFormData {
  // Company Info
  name: string;
  description: string;
  fiscalId: string;
  slug: string;
  // Contact Info
  address: string;
  contactEmail: string;
  contactPhone: string;
  // Plan
  selectedPlan: 'basic' | 'professional' | 'premium';
}

interface UpgradeToCompanyWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UpgradeToCompanyWizard = ({ open, onOpenChange }: UpgradeToCompanyWizardProps) => {
  const { upgradeToCompany } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CompanyUpgradeFormData>({
    name: '',
    description: '',
    fiscalId: '',
    slug: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    selectedPlan: 'basic'
  });

  // Define all wizard steps
  const steps: WizardStep[] = [
    { id: 'company-info', title: 'Información de la Empresa' },
    { id: 'contact-info', title: 'Información de Contacto' },
    { id: 'select-plan', title: 'Seleccionar Plan' },
    { id: 'success', title: 'Completado' },
  ];

  const currentStep = steps[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleUpdateFormData = (data: Partial<CompanyUpgradeFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // This would normally send all the form data, but for now we just use the name
      await upgradeToCompany(formData.name);
      
      // Move to success step
      setCurrentStepIndex(steps.length - 1);
    } catch (error) {
      console.error('Error upgrading to company:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (currentStepIndex === steps.length - 1) {
      // Reset form if we're on the success step
      setCurrentStepIndex(0);
      setFormData({
        name: '',
        description: '',
        fiscalId: '',
        slug: '',
        address: '',
        contactEmail: '',
        contactPhone: '',
        selectedPlan: 'basic'
      });
    }
    onOpenChange(false);
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep.id) {
      case 'company-info':
        return (
          <CompanyInfoStep 
            formData={formData} 
            onUpdateFormData={handleUpdateFormData} 
            onNext={handleNext} 
            onBack={handleClose} 
          />
        );
      case 'contact-info':
        return (
          <ContactInfoStep 
            formData={formData} 
            onUpdateFormData={handleUpdateFormData} 
            onNext={handleNext} 
            onBack={handleBack} 
          />
        );
      case 'select-plan':
        return (
          <SelectPlanStep 
            formData={formData} 
            onUpdateFormData={handleUpdateFormData} 
            onComplete={handleComplete} 
            onBack={handleBack} 
            isSubmitting={isSubmitting} 
          />
        );
      case 'success':
        return (
          <SuccessStep 
            planName={formData.selectedPlan === 'basic' 
              ? 'Básico' 
              : formData.selectedPlan === 'professional' 
                ? 'Profesional' 
                : 'Premium'
            } 
            companyName={formData.name} 
            onClose={handleClose} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="space-y-6">
          {/* Progress indicator */}
          {currentStepIndex < steps.length - 1 && (
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                {steps.slice(0, steps.length - 1).map((step, index) => (
                  <div 
                    key={step.id} 
                    className={`text-xs font-medium ${index <= currentStepIndex ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    {step.title}
                  </div>
                ))}
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all" 
                  style={{ width: `${(currentStepIndex / (steps.length - 2)) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Step content */}
          {renderStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeToCompanyWizard;
