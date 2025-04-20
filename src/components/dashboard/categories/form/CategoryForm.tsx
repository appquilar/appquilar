
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { CategoryFormData } from '@/domain/models/Category';
import FormActions from '../../common/FormActions';
import CategoryBasicInfoFields from './CategoryBasicInfoFields';
import CategoryImagesFields from './CategoryImagesFields';

interface CategoryFormProps {
  defaultValues: CategoryFormData;
  isSubmitting: boolean;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
}

const CategoryForm = ({ defaultValues, isSubmitting, onSubmit, onCancel }: CategoryFormProps) => {
  const form = useForm<CategoryFormData>({
    defaultValues
  });

  const handleSubmit = async (data: CategoryFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Error al guardar la categoría");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <CategoryBasicInfoFields form={form} />
      <CategoryImagesFields form={form} />
      <FormActions isSubmitting={isSubmitting} onCancel={onCancel} />
    </form>
  );
};

export default CategoryForm;
