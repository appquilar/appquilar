
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { z } from 'zod';

// Import steps
import CompanyInfoStep from './steps/CompanyInfoStep';
import ContactInfoStep from './steps/ContactInfoStep';
import SelectPlanStep from './steps/SelectPlanStep';
import SuccessStep from './steps/SuccessStep';

// Form schema
const companyFormSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  fiscalId: z.string().min(5),
  slug: z.string().min(3),
  address: z.string().min(5),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(9),
  selectedPlan: z.enum(['basic', 'professional', 'premium'])
});

export type CompanyFormData = z.infer<typeof companyFormSchema>;

type Step = 'info' | 'contact' | 'plan' | 'success';

const UpgradePage = () => {
  const navigate = useNavigate();
  const { upgradeToCompany } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    description: '',
    fiscalId: '',
    slug: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    selectedPlan: 'basic'
  });

  const handleUpdateFormData = (data: Partial<CompanyFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleNext = (step: Step) => {
    setCurrentStep(step);
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await upgradeToCompany(formData.name);
      setCurrentStep('success');
    } catch (error) {
      console.error('Error upgrading to company:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 'contact') {
      setCurrentStep('info');
    } else if (currentStep === 'plan') {
      setCurrentStep('contact');
    } else if (currentStep === 'success') {
      // If on success page, go to dashboard
      navigate('/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleClose = () => {
    navigate('/dashboard');
  };

  return (
    <div className="container max-w-5xl py-4 sm:py-8 px-4 sm:px-6">
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Actualizar a Cuenta de Empresa</h1>
          <p className="text-muted-foreground">
            Completa la información necesaria para convertir tu cuenta en una cuenta de empresa.
          </p>
        </div>

        {/* Progress bar (only show if not on success step) */}
        {currentStep !== 'success' && (
          <div className="w-full">
            <div className="flex justify-between mb-2 px-1 text-xs sm:text-sm">
              <div className={`font-medium ${currentStep === 'info' ? 'text-primary' : ''}`}>
                Información
              </div>
              <div className={`font-medium ${currentStep === 'contact' ? 'text-primary' : ''}`}>
                Contacto
              </div>
              <div className={`font-medium ${currentStep === 'plan' ? 'text-primary' : ''}`}>
                Plan
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className="bg-primary h-full transition-all" 
                style={{ 
                  width: currentStep === 'info' 
                    ? '33.3%' 
                    : currentStep === 'contact' 
                      ? '66.6%' 
                      : '100%' 
                }}
              />
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          {currentStep === 'info' && (
            <CompanyInfoStep 
              formData={formData} 
              onUpdateFormData={handleUpdateFormData} 
              onNext={() => handleNext('contact')}
              onBack={handleBack}
            />
          )}

          {currentStep === 'contact' && (
            <ContactInfoStep 
              formData={formData} 
              onUpdateFormData={handleUpdateFormData} 
              onNext={() => handleNext('plan')}
              onBack={handleBack}
            />
          )}

          {currentStep === 'plan' && (
            <SelectPlanStep 
              formData={formData} 
              onUpdateFormData={handleUpdateFormData} 
              onComplete={handleComplete}
              onBack={handleBack}
              isSubmitting={isSubmitting}
            />
          )}

          {currentStep === 'success' && (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default UpgradePage;
