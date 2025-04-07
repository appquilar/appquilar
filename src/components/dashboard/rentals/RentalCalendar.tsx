
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { CaptionProps } from 'react-day-picker';
import { Rental } from '@/domain/models/Rental';
import { useIsMobile } from '@/hooks/use-mobile';

interface RentalCalendarProps {
  rentals: Rental[]; 
  onDateSelect?: (date: Date) => void;
  currentMonth: Date;
  onMonthChange?: (date: Date) => void;
}

const RentalCalendar = ({ 
  rentals, 
  onDateSelect, 
  currentMonth, 
  onMonthChange 
}: RentalCalendarProps) => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const isMobile = useIsMobile();

  // Get dates that have rentals
  const rentalDates = rentals.flatMap(rental => {
    const startDate = new Date(rental.startDate);
    const endDate = new Date(rental.endDate);
    const dates = [];
    
    // Add all dates between start and end date
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  });

  // Check if a date has rentals
  const hasRentals = (date: Date) => {
    return rentalDates.some(rentalDate => isSameDay(rentalDate, date));
  };

  // Handle date selection
  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date && onDateSelect) {
      onDateSelect(date);
    }
  };

  // Custom day render to show rentals
  const renderDay = (day: Date) => {
    const hasRental = hasRentals(day);
    const isToday = isSameDay(day, today);
    
    return (
      <div className={cn(
        "relative flex items-center justify-center",
        hasRental && "font-medium",
        isToday && "text-primary"
      )}>
        {day.getDate()}
        {hasRental && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-gray-300 rounded-full" />
        )}
      </div>
    );
  };

  // Custom caption component for month and year display
  const CustomCaption = (props: CaptionProps) => {
    return (
      <div className="text-center py-1 font-medium">
        {format(props.displayMonth, 'MMMM yyyy', { locale: es })}
      </div>
    );
  };

  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        <div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            month={currentMonth}
            onMonthChange={onMonthChange}
            locale={es}
            className="w-full max-w-full p-0 border-0"
            classNames={{
              month: "space-y-2",
              table: "w-full border-collapse",
              head_row: "flex",
              head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem] md:w-10",
              row: "flex w-full mt-1",
              cell: "h-8 w-8 md:h-9 md:w-9 text-center text-sm p-0 relative",
              day: "h-8 w-8 md:h-9 md:w-9 p-0 font-normal aria-selected:opacity-100"
            }}
            components={{
              DayContent: ({ date }) => renderDay(date),
              Caption: CustomCaption
            }}
          />
        </div>
        
        {!isMobile && (
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              month={new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)}
              onMonthChange={onMonthChange}
              locale={es}
              className="w-full max-w-full p-0 border-0"
              classNames={{
                month: "space-y-2",
                table: "w-full border-collapse",
                head_row: "flex",
                head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem] md:w-10",
                row: "flex w-full mt-1",
                cell: "h-8 w-8 md:h-9 md:w-9 text-center text-sm p-0 relative",
                day: "h-8 w-8 md:h-9 md:w-9 p-0 font-normal aria-selected:opacity-100"
              }}
              components={{
                DayContent: ({ date }) => renderDay(date),
                Caption: CustomCaption
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RentalCalendar;
