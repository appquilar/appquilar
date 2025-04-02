
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SiteFormData } from '@/domain/models/Site';
import SiteLogoUpload from './SiteLogoUpload';

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
      
      {/* Logo Upload */}
      <SiteLogoUpload form={form} />
    </div>
  );
};

export default SiteBasicInfoFields;
