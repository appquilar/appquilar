
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { CategoryFormData } from '@/domain/models/Category';
import CategoryImageUpload from './CategoryImageUpload';

interface CategoryImagesFieldsProps {
  form: UseFormReturn<CategoryFormData>;
}

const CategoryImagesFields = ({ form }: CategoryImagesFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="headerImageUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Imagen de cabecera</FormLabel>
            <FormControl>
              <CategoryImageUpload
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="featuredImageUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Imagen destacada</FormLabel>
            <FormControl>
              <CategoryImageUpload
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default CategoryImagesFields;
