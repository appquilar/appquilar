
import React from 'react';
import { Control, useFieldArray } from 'react-hook-form';
import { ProductFormValues } from './productFormSchema';
import { FormLabel, FormDescription, FormField, FormItem, FormControl } from '@/components/ui/form';
import AvailabilityPeriodItem from './availability/AvailabilityPeriodItem';
import NewAvailabilityPeriod from './availability/NewAvailabilityPeriod';
import { formatToISODate } from './availability/dateUtils';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface ProductAvailabilityFieldsProps {
  control: Control<ProductFormValues>;
}

const ProductAvailabilityFields = ({ control }: ProductAvailabilityFieldsProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'availability',
  });

  // Add a new availability period
  const handleAddPeriod = (
    startDate: Date, 
    endDate: Date, 
    includeWeekends: boolean
  ) => {
    append({
      id: `period-${Date.now()}`,
      startDate: formatToISODate(startDate),
      endDate: formatToISODate(endDate),
      status: 'available',
      includeWeekends
    });
  };

  return (
    <div className="space-y-6">
      <FormLabel className="text-base">Periodos de Disponibilidad</FormLabel>
      <FormDescription>
        Establece cuándo este producto está disponible para alquilar.
      </FormDescription>

      {/* Global always available switch */}
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

      {/* Current availability periods */}
      <FormField
        control={control}
        name="isAlwaysAvailable"
        render={({ field }) => (
          <div className={`space-y-4 ${field.value ? 'opacity-50 pointer-events-none' : ''}`}>
            {field.value && (
              <div className="p-3 bg-primary/10 rounded-lg flex items-center gap-2 text-primary">
                <CheckCircle size={18} />
                <span>Este producto está marcado como siempre disponible</span>
              </div>
            )}
            
            {fields.map((field, index) => (
              <AvailabilityPeriodItem
                key={field.id}
                control={control}
                index={index}
                field={field}
                remove={remove}
              />
            ))}

            {/* Add new availability period */}
            <NewAvailabilityPeriod onAddPeriod={handleAddPeriod} />
          </div>
        )}
      />
    </div>
  );
};

export default ProductAvailabilityFields;
