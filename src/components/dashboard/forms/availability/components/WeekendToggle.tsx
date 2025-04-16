
import React from 'react';
import { FormField, FormItem, FormControl, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Control } from 'react-hook-form';
import { ProductFormValues } from '../../productFormSchema';

interface WeekendToggleProps {
  control: Control<ProductFormValues>;
  index: number;
}

const WeekendToggle: React.FC<WeekendToggleProps> = ({ control, index }) => {
  return (
    <FormField
      control={control}
      name={`availability.${index}.includeWeekends`}
      render={({ field }) => (
        <FormItem className="flex items-center gap-2">
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <FormLabel className="text-sm">También fines de semana</FormLabel>
        </FormItem>
      )}
    />
  );
};

export default WeekendToggle;
