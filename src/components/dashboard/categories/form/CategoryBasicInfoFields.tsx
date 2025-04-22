
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategoryFormData } from '@/domain/models/Category';
import { useEffect, useState } from 'react';
import IconPicker from '../icon-picker/IconPicker';
import { MockCategoryRepository } from '@/infrastructure/repositories/MockCategoryRepository';

interface CategoryBasicInfoFieldsProps {
  form: UseFormReturn<CategoryFormData>;
}

const CategoryBasicInfoFields = ({ form }: CategoryBasicInfoFieldsProps) => {
  const [parentCategories, setParentCategories] = useState<{ id: string; name: string; }[]>([]);
  const categoryRepository = new MockCategoryRepository();

  useEffect(() => {
    const loadParentCategories = async () => {
      const categories = await categoryRepository.getAllCategories();
      setParentCategories(categories);
    };
    loadParentCategories();
  }, []);

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
            <Select
              value={field.value || "none"}
              onValueChange={(value) => field.onChange(value === "none" ? null : value)}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría padre (opcional)" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">Sin categoría padre</SelectItem>
                {parentCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
