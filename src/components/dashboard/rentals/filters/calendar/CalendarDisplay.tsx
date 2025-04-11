
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
    <div className="flex justify-center">
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
        className={cn("p-0 pointer-events-auto")}
        classNames={{
          caption: "hidden", // Hide the caption that contains the month/year header
          months: "flex justify-center",
          month: "space-y-2",
          table: "w-full border-collapse",
          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20"
        }}
      />
    </div>
  );
};

export default CalendarDisplay;
