
import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DateRangeInputsProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  selectingDate: 'start' | 'end';
  onSelectDate: (selecting: 'start' | 'end') => void;
}

const DateRangeInputs = ({ 
  startDate, 
  endDate, 
  selectingDate, 
  onSelectDate 
}: DateRangeInputsProps) => {
  // Format date for display
  const formatDisplayDate = (date: Date | undefined) => {
    return date ? format(date, 'dd/MM/yyyy', { locale: es }) : '';
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <p className="text-xs text-muted-foreground mb-1">Fecha inicio</p>
        <Input 
          value={formatDisplayDate(startDate)} 
          readOnly 
          onClick={() => onSelectDate('start')}
          className={cn(
            "cursor-pointer",
            selectingDate === 'start' && "ring-2 ring-primary"
          )}
        />
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">Fecha fin</p>
        <Input 
          value={formatDisplayDate(endDate)} 
          readOnly 
          onClick={() => onSelectDate('end')}
          className={cn(
            "cursor-pointer",
            selectingDate === 'end' && "ring-2 ring-primary"
          )}
        />
      </div>
    </div>
  );
};

export default DateRangeInputs;
