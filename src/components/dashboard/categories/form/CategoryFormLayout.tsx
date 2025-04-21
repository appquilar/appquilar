
import { UseFormReturn } from 'react-hook-form';
import { Form } from '@/components/ui/form';  // Import Form provider
import { CategoryFormData } from '@/domain/models/Category';
import FormActions from '../../common/FormActions';
import CategoryBasicInfoFields from './CategoryBasicInfoFields';
import CategoryImagesFields from './CategoryImagesFields';

interface CategoryFormLayoutProps {
  form: UseFormReturn<CategoryFormData>;
  isSubmitting: boolean;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
}

const CategoryFormLayout = ({
  form,
  isSubmitting,
  onSubmit,
  onCancel
}: CategoryFormLayoutProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CategoryBasicInfoFields form={form} />
        <CategoryImagesFields form={form} />
        <FormActions isSubmitting={isSubmitting} onCancel={onCancel} />
      </form>
    </Form>
  );
};

export default CategoryFormLayout;
