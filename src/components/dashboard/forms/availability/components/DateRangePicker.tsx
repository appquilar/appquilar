
import React from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { ProductFormValues } from '../../productFormSchema';
import DateInput from './DateInput';

interface DateRangePickerProps {
  control: Control<ProductFormValues>;
  index: number;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ control, index }) => {
  return (
    <div className="flex items-center gap-2">
      <DateInput<ProductFormValues, `availability.${number}.startDate`>
        control={control}
        name={`availability.${index}.startDate` as const}
        label="Fecha inicio"
      />
      <span>hasta</span>
      <DateInput<ProductFormValues, `availability.${number}.endDate`>
        control={control}
        name={`availability.${index}.endDate` as const}
        label="Fecha fin"
      />
    </div>
  );
};

export default DateRangePicker;
