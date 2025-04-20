
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CategoryFormData } from '@/domain/models/Category';
import CategorySelector from '../CategorySelector';
import IconPicker from '../icon-picker/IconPicker';

interface CategoryBasicInfoFieldsProps {
  form: UseFormReturn<CategoryFormData>;
}

const CategoryBasicInfoFields = ({ form }: CategoryBasicInfoFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre</FormLabel>
            <FormControl>
              <Input placeholder="Nombre de la categoría" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Slug</FormLabel>
            <FormControl>
              <Input placeholder="slug-de-categoria" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="parentId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categoría Padre</FormLabel>
            <FormControl>
              <CategorySelector
                selectedCategoryId={field.value}
                onCategoryChange={field.onChange}
                placeholder="Seleccionar categoría padre (opcional)"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="iconUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Icono</FormLabel>
            <FormControl>
              <IconPicker
                selectedIcon={field.value}
                onSelectIcon={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default CategoryBasicInfoFields;
