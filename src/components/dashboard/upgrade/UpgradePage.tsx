
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import SelectPlanStep from './steps/SelectPlanStep';

const UpgradePage = () => {
  const navigate = useNavigate();
  const { upgradeToCompany } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    selectedPlan: 'basic' as 'basic' | 'professional' | 'premium'
  });

  const handleUpdateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // This would integrate with the complete wizard in a real app
      await upgradeToCompany("Mi Empresa");
      navigate('/dashboard');
    } catch (error) {
      console.error('Error upgrading to company:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="container max-w-5xl py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Actualizar a Cuenta de Empresa</h1>
          <p className="text-muted-foreground">
            Selecciona el plan que mejor se adapte a tus necesidades para empezar a alquilar tus productos.
          </p>
        </div>

        <SelectPlanStep
          formData={{ ...formData, name: '', description: '', fiscalId: '', slug: '', address: '', contactEmail: '', contactPhone: '' }}
          onUpdateFormData={handleUpdateFormData}
          onComplete={handleComplete}
          onBack={handleBack}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default UpgradePage;
