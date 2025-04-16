
import React from 'react';
import { Control } from 'react-hook-form';
import { ProductFormValues } from '../../productFormSchema';
import DateInput from './DateInput';

interface DateRangePickerProps {
  control: Control<ProductFormValues>;
  index: number;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ control, index }) => {
  return (
    <div className="flex items-center gap-2">
      <DateInput 
        control={control}
        name={`availability.${index}.startDate`}
        label="Fecha inicio"
      />
      <span>hasta</span>
      <DateInput
        control={control}
        name={`availability.${index}.endDate`}
        label="Fecha fin"
      />
    </div>
  );
};

export default DateRangePicker;
