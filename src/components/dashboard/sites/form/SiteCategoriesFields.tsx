
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { SiteFormData } from '@/domain/models/Site';
import { Category } from '@/domain/models/Category';
import CategoryMultiSelector from '../../categories/CategoryMultiSelector';
import { SITE_CONFIG } from '@/domain/config/siteConfig';

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
            <FormDescription>
              Máximo {SITE_CONFIG.MAX_MENU_CATEGORIES} categorías permitidas
            </FormDescription>
            <FormControl>
              <CategoryMultiSelector
                categories={categories.filter(cat => form.getValues().categoryIds.includes(cat.id))}
                selectedCategoryIds={field.value}
                onCategoriesChange={(selectedIds) => {
                  // Enforce the maximum number of menu categories
                  if (selectedIds.length <= SITE_CONFIG.MAX_MENU_CATEGORIES) {
                    field.onChange(selectedIds);
                  } else {
                    // If the user tries to select more than allowed, take only the first MAX_MENU_CATEGORIES
                    field.onChange(selectedIds.slice(0, SITE_CONFIG.MAX_MENU_CATEGORIES));
                  }
                }}
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
            <FormDescription>
              Máximo {SITE_CONFIG.MAX_FEATURED_CATEGORIES} categorías permitidas
            </FormDescription>
            <FormControl>
              <CategoryMultiSelector
                categories={categories.filter(cat => form.getValues().categoryIds.includes(cat.id))}
                selectedCategoryIds={field.value}
                onCategoriesChange={(selectedIds) => {
                  // Enforce the maximum number of featured categories
                  if (selectedIds.length <= SITE_CONFIG.MAX_FEATURED_CATEGORIES) {
                    field.onChange(selectedIds);
                  } else {
                    // If the user tries to select more than allowed, take only the first MAX_FEATURED_CATEGORIES
                    field.onChange(selectedIds.slice(0, SITE_CONFIG.MAX_FEATURED_CATEGORIES));
                  }
                }}
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
