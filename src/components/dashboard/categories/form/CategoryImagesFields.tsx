
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { CategoryFormData } from '@/domain/models/Category';
import CategoryImageUpload from './CategoryImageUpload';

interface CategoryImagesFieldsProps {
  form: UseFormReturn<CategoryFormData>;
}

const CategoryImagesFields = ({ form }: CategoryImagesFieldsProps) => {
  return (
    <div className="space-y-6 w-full">
      <FormField
        control={form.control}
        name="headerImageUrl"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>Imagen de cabecera</FormLabel>
            <FormControl>
              <CategoryImageUpload
                value={field.value}
                onChange={field.onChange}
                className="w-full"
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
          <FormItem className="w-full">
            <FormLabel>Imagen destacada</FormLabel>
            <FormControl>
              <CategoryImageUpload
                value={field.value}
                onChange={field.onChange}
                className="w-full"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default CategoryImagesFields;
