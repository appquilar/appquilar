
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface CalendarDisplayProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  viewDate: Date;
  onDateSelect: (range: { from?: Date; to?: Date }) => void;
  onMonthChange: (date: Date) => void;
}

const CalendarDisplay = ({ 
  startDate, 
  endDate, 
  viewDate, 
  onDateSelect,
  onMonthChange
}: CalendarDisplayProps) => {
  return (
    <Calendar
      mode="range"
      selected={{
        from: startDate,
        to: endDate,
      }}
      onSelect={onDateSelect}
      initialFocus
      locale={es}
      month={viewDate}
      onMonthChange={onMonthChange}
      className={cn("p-3 pointer-events-auto")}
      classNames={{
        caption: "hidden" // Hide the caption that contains the month/year header
      }}
    />
  );
};

export default CalendarDisplay;
