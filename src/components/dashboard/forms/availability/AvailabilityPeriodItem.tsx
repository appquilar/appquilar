
import React from 'react';
import { Control, UseFieldArrayRemove } from 'react-hook-form';
import { ProductFormValues } from '../productFormSchema';
import { Card, CardContent } from '@/components/ui/card';
import StatusToggleGroup from './components/StatusToggleGroup';
import DateRangePicker from './components/DateRangePicker';
import WeekendToggle from './components/WeekendToggle';
import DeletePeriodButton from './components/DeletePeriodButton';

interface AvailabilityPeriodItemProps {
  control: Control<ProductFormValues>;
  index: number;
  field: Record<string, any>;
  remove: UseFieldArrayRemove;
}

const AvailabilityPeriodItem = ({ 
  control, 
  index, 
  field, 
  remove 
}: AvailabilityPeriodItemProps) => {
  return (
    <Card key={field.id} className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <StatusToggleGroup control={control} index={index} />
            </div>
            
            <DateRangePicker control={control} index={index} />
            
            <div className="mt-3 flex items-center gap-6">
              <WeekendToggle control={control} index={index} />
            </div>
          </div>
          
          <DeletePeriodButton index={index} remove={remove} />
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailabilityPeriodItem;
