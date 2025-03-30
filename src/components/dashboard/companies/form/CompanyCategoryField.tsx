
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { CompanyFormData } from '@/domain/models/Company';
import { Category } from '@/domain/models/Category';
import CategoryMultiSelector from '../../categories/CategoryMultiSelector';

interface CompanyCategoryFieldProps {
  form: UseFormReturn<CompanyFormData>;
  categories: Category[];
}

const CompanyCategoryField = ({ form, categories }: CompanyCategoryFieldProps) => {
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

export default CompanyCategoryField;
