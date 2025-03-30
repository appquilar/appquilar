
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SiteFormData } from '@/domain/models/Site';

interface SiteBasicInfoFieldsProps {
  form: UseFormReturn<SiteFormData>;
}

const SiteBasicInfoFields = ({ form }: SiteBasicInfoFieldsProps) => {
  return (
    <div className="space-y-6">
      {/* Nombre */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre</FormLabel>
            <FormControl>
              <Input placeholder="Nombre del sitio" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Dominio */}
      <FormField
        control={form.control}
        name="domain"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dominio</FormLabel>
            <FormControl>
              <Input placeholder="ejemplo.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Logo URL */}
      <FormField
        control={form.control}
        name="logo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL del Logo</FormLabel>
            <FormControl>
              <Input placeholder="https://ejemplo.com/logo.png" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default SiteBasicInfoFields;
