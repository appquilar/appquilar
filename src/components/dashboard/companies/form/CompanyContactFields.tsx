
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { CompanyFormData } from '@/domain/models/Company';

interface CompanyContactFieldsProps {
  form: UseFormReturn<CompanyFormData>;
}

const CompanyContactFields = ({ form }: CompanyContactFieldsProps) => {
  return (
    <>
      <h3 className="text-lg font-medium mb-4">Información de Contacto</h3>
      {/* ID Fiscal */}
      <FormField
        control={form.control}
        name="fiscalId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>ID Fiscal</FormLabel>
            <FormControl>
              <Input placeholder="B12345678" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Dirección */}
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dirección</FormLabel>
            <FormControl>
              <Input placeholder="Calle, número, ciudad" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Email de contacto */}
      <FormField
        control={form.control}
        name="contactEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email de contacto</FormLabel>
            <FormControl>
              <Input placeholder="contacto@empresa.com" type="email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Teléfono de contacto */}
      <FormField
        control={form.control}
        name="contactPhone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Teléfono de contacto</FormLabel>
            <FormControl>
              <Input placeholder="+34 911 234 567" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default CompanyContactFields;
