
import { UseFormReturn } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { SiteFormData } from '@/domain/models/Site';
import { Form } from '@/components/ui/form';
import FormActions from '../../common/FormActions';
import { MOCK_CATEGORIES } from '../../categories/data/mockCategories';
import SiteBasicInfoFields from './SiteBasicInfoFields';
import SiteContentFields from './SiteContentFields';
import SiteStyleFields from './SiteStyleFields';
import SiteCategoriesFields from './SiteCategoriesFields';
import { useSiteOperations } from '../hooks/useSiteOperations';

interface SiteFormProps {
  form: UseFormReturn<SiteFormData>;
  isAddMode: boolean;
  siteId?: string;
}

const SiteForm = ({ form, isAddMode, siteId }: SiteFormProps) => {
  const navigate = useNavigate();
  const { saveSite, isSubmitting } = useSiteOperations(siteId);

  const onSubmit = async (data: SiteFormData) => {
    await saveSite(data);
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
        
        <SiteCategoriesFields form={form} categories={MOCK_CATEGORIES} />
        
        <FormActions 
          isSubmitting={isSubmitting} 
          onCancel={() => navigate('/dashboard/sites')} 
        />
      </form>
    </Form>
  );
};

export default SiteForm;
