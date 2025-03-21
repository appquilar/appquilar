
import React from 'react';
import { Control, useFieldArray } from 'react-hook-form';
import { ProductFormValues } from './productFormSchema';
import { FormLabel, FormDescription } from '@/components/ui/form';
import AvailabilityPeriodItem from './availability/AvailabilityPeriodItem';
import NewAvailabilityPeriod from './availability/NewAvailabilityPeriod';
import { formatToISODate } from './availability/dateUtils';

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
    includeWeekends: boolean, 
    isAlwaysAvailable: boolean
  ) => {
    append({
      id: `period-${Date.now()}`,
      startDate: formatToISODate(startDate),
      endDate: formatToISODate(endDate),
      status: 'available',
      includeWeekends,
      isAlwaysAvailable
    });
  };

  return (
    <div className="space-y-6">
      <FormLabel className="text-base">Periodos de Disponibilidad</FormLabel>
      <FormDescription>
        Establece cuándo este producto está disponible para alquilar.
      </FormDescription>

      {/* Current availability periods */}
      <div className="space-y-4">
        {fields.map((field, index) => (
          <AvailabilityPeriodItem
            key={field.id}
            control={control}
            index={index}
            field={field}
            remove={remove}
          />
        ))}
      </div>

      {/* Add new availability period */}
      <NewAvailabilityPeriod onAddPeriod={handleAddPeriod} />
    </div>
  );
};

export default ProductAvailabilityFields;
