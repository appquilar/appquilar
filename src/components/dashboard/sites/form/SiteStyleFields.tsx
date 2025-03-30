
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SiteFormData } from '@/domain/models/Site';

interface SiteStyleFieldsProps {
  form: UseFormReturn<SiteFormData>;
}

const SiteStyleFields = ({ form }: SiteStyleFieldsProps) => {
  return (
    <div className="space-y-6">
      {/* Color Primario */}
      <FormField
        control={form.control}
        name="primaryColor"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Color Primario</FormLabel>
            <div className="flex gap-2 items-center">
              <FormControl>
                <Input type="color" {...field} className="w-12 h-10 p-1" />
              </FormControl>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default SiteStyleFields;
