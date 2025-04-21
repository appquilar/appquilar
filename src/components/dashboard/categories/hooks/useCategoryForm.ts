
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { CategoryFormData } from '@/domain/models/Category';

interface UseCategoryFormProps {
  defaultValues: CategoryFormData;
  onSubmit: (data: CategoryFormData) => Promise<void>;
}

export const useCategoryForm = ({ defaultValues, onSubmit }: UseCategoryFormProps) => {
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

  return {
    form,
    handleSubmit,
    isSubmitting: form.formState.isSubmitting
  };
};
