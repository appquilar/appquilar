
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { SiteFormData } from '@/domain/models/Site';
import { Category } from '@/domain/models/Category';
import CategoryMultiSelector from '../../categories/CategoryMultiSelector';

interface SiteCategoriesFieldsProps {
  form: UseFormReturn<SiteFormData>;
  categories: Category[];
}

const SiteCategoriesFields = ({ form, categories }: SiteCategoriesFieldsProps) => {
  return (
    <div className="space-y-6">
      {/* All Categories */}
      <FormField
        control={form.control}
        name="categoryIds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categorías disponibles</FormLabel>
            <FormControl>
              <CategoryMultiSelector
                categories={categories}
                selectedCategoryIds={field.value}
                onCategoriesChange={field.onChange}
                placeholder="Seleccionar categorías disponibles"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Menu Categories */}
      <FormField
        control={form.control}
        name="menuCategoryIds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categorías del menú</FormLabel>
            <FormControl>
              <CategoryMultiSelector
                categories={categories.filter(cat => form.getValues().categoryIds.includes(cat.id))}
                selectedCategoryIds={field.value}
                onCategoriesChange={field.onChange}
                placeholder="Seleccionar categorías para el menú"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Featured Categories */}
      <FormField
        control={form.control}
        name="featuredCategoryIds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categorías destacadas</FormLabel>
            <FormControl>
              <CategoryMultiSelector
                categories={categories.filter(cat => form.getValues().categoryIds.includes(cat.id))}
                selectedCategoryIds={field.value}
                onCategoriesChange={field.onChange}
                placeholder="Seleccionar categorías destacadas"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default SiteCategoriesFields;
