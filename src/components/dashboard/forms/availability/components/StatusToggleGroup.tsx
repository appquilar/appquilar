
import React from 'react';
import { FormField } from '@/components/ui/form';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { Control } from 'react-hook-form';
import { ProductFormValues } from '../../productFormSchema';

interface StatusToggleGroupProps {
  control: Control<ProductFormValues>;
  index: number;
}

const StatusToggleGroup: React.FC<StatusToggleGroupProps> = ({ control, index }) => {
  return (
    <FormField
      control={control}
      name={`availability.${index}.status`}
      render={({ field }) => (
        <ToggleGroup
          type="single"
          value={field.value}
          onValueChange={(value) => {
            if (value) field.onChange(value);
          }}
          className="flex gap-1"
        >
          <ToggleGroupItem 
            value="available"
            className={cn(
              field.value === 'available' ? 'bg-green-100 text-green-800' : ''
            )}
          >
            Disponible
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="unavailable"
            className={cn(
              field.value === 'unavailable' ? 'bg-red-100 text-red-800' : ''
            )}
          >
            No Disponible
          </ToggleGroupItem>
        </ToggleGroup>
      )}
    />
  );
};

export default StatusToggleGroup;
