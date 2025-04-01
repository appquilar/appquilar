
import React, { useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { CompanyFormData } from '@/domain/models/Company';

interface CompanyBasicInfoFieldsProps {
  form: UseFormReturn<CompanyFormData>;
}

const CompanyBasicInfoFields = ({ form }: CompanyBasicInfoFieldsProps) => {
  // Auto-generate slug from company name
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'name') {
        const nameValue = value.name as string;
        if (nameValue) {
          // Generate slug: lowercase, replace spaces with hyphens, remove special chars
          const generatedSlug = nameValue
            .toLowerCase()
            .normalize('NFD') // Normalize accented characters
            .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-'); // Replace multiple hyphens with a single one
            
          form.setValue('slug', generatedSlug, { shouldValidate: true });
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <>
      {/* Nombre */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre</FormLabel>
            <FormControl>
              <Input placeholder="Nombre de la empresa" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Descripción */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descripción</FormLabel>
            <FormControl>
              <Textarea placeholder="Descripción de la empresa" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Slug */}
      <FormField
        control={form.control}
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Slug</FormLabel>
            <FormControl>
              <Input placeholder="slug-de-empresa" {...field} />
            </FormControl>
            <FormMessage />
            <p className="text-xs text-muted-foreground">Se genera automáticamente a partir del nombre</p>
          </FormItem>
        )}
      />
    </>
  );
};

export default CompanyBasicInfoFields;
