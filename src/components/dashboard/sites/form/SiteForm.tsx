
import { useNavigate } from 'react-router-dom';
import { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

import { Form } from '@/components/ui/form';
import { SiteFormData } from '@/domain/models/Site';
import FormActions from '../../common/FormActions';
import { MOCK_CATEGORIES } from '../../categories/data/mockCategories';
import SiteBasicInfoFields from './SiteBasicInfoFields';
import SiteContentFields from './SiteContentFields';
import SiteStyleFields from './SiteStyleFields';
import SiteCategoryField from './SiteCategoryField';

interface SiteFormProps {
  form: UseFormReturn<SiteFormData>;
  isAddMode: boolean;
}

const SiteForm = ({ form, isAddMode }: SiteFormProps) => {
  const navigate = useNavigate();

  const onSubmit = (data: SiteFormData) => {
    // In a real app, this would save the site via API call
    console.log('Saving site:', data);
    
    toast.success(isAddMode 
      ? 'Sitio creado correctamente' 
      : 'Sitio actualizado correctamente'
    );
    
    navigate('/dashboard/sites');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <SiteBasicInfoFields form={form} />
          </div>
          <div className="space-y-8">
            <SiteContentFields form={form} />
            <SiteStyleFields form={form} />
          </div>
        </div>
        
        <SiteCategoryField form={form} categories={MOCK_CATEGORIES} />
        
        <FormActions 
          isSubmitting={form.formState.isSubmitting} 
          onCancel={() => navigate('/dashboard/sites')} 
        />
      </form>
    </Form>
  );
};

export default SiteForm;
