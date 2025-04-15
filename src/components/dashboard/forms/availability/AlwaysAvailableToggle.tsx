
import React from 'react';
import { Control } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormDescription, FormControl } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { ProductFormValues } from '../productFormSchema';

interface AlwaysAvailableToggleProps {
  control: Control<ProductFormValues>;
}

const AlwaysAvailableToggle = ({ control }: AlwaysAvailableToggleProps) => {
  return (
    <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
      <CardContent className="p-4">
        <FormField
          control={control}
          name="isAlwaysAvailable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg bg-background p-3">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Siempre Disponible</FormLabel>
                <FormDescription>
                  Marca este producto como siempre disponible, sin restricciones de fecha
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default AlwaysAvailableToggle;
