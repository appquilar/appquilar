
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { SiteFormData } from '@/domain/models/Site';
import { Category } from '@/domain/models/Category';
import CategoryMultiSelector from '../../categories/CategoryMultiSelector';

interface SiteCategoryFieldProps {
  form: UseFormReturn<SiteFormData>;
  categories: Category[];
}

const SiteCategoryField = ({ form, categories }: SiteCategoryFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="categoryIds"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Categorías</FormLabel>
          <FormControl>
            <CategoryMultiSelector
              categories={categories}
              selectedCategoryIds={field.value}
              onCategoriesChange={field.onChange}
              placeholder="Seleccionar categorías"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SiteCategoryField;
