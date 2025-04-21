
import { CategoryFormData } from '@/domain/models/Category';
import { useCategoryForm } from '../hooks/useCategoryForm';
import CategoryFormLayout from './CategoryFormLayout';

interface CategoryFormProps {
  defaultValues: CategoryFormData;
  isSubmitting: boolean;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
}

const CategoryForm = ({ defaultValues, onSubmit, onCancel }: CategoryFormProps) => {
  const { form, handleSubmit, isSubmitting } = useCategoryForm({
    defaultValues,
    onSubmit
  });

  return (
    <CategoryFormLayout
      form={form}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
};

export default CategoryForm;
