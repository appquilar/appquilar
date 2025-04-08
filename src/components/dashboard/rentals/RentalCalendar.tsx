
import React, { useState } from 'react';
import { format, addMonths, isSameDay, isSameMonth, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Rental } from '@/domain/models/Rental';
import { useIsMobile } from '@/hooks/use-mobile';

interface RentalCalendarProps {
  rentals: Rental[]; 
  onDateSelect?: (date: Date) => void;
  currentMonth: Date;
  onMonthChange?: (date: Date) => void;
}

const WEEKDAYS = ['lu', 'ma', 'mi', 'ju', 'vi', 'sa', 'do'];

const RentalCalendar = ({ 
  rentals, 
  onDateSelect, 
  currentMonth,
  onMonthChange 
}: RentalCalendarProps) => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const isMobile = useIsMobile();
  const nextMonth = addMonths(currentMonth, 1);

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
  const handleSelect = (date: Date) => {
    setSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  // Generate calendar days for a given month
  const generateCalendarDays = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const startDate = startOfWeek(monthStart, { locale: es });
    const endDate = endOfWeek(monthEnd, { locale: es });

    const rows = [];
    let days = [];
    let day = startDate;

    // Generate header with weekday names
    const weekdayHeader = WEEKDAYS.map((weekday, i) => (
      <div key={`header-${weekday}-${i}`} className="text-center text-xs font-medium text-muted-foreground w-10 h-6 flex items-center justify-center">
        {weekday}
      </div>
    ));
    rows.push(weekdayHeader);

    // Generate calendar grid
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const currentDay = day;
        const isToday = isSameDay(day, today);
        const isCurrentMonth = isSameMonth(day, month);
        const hasRental = hasRentals(day);
        
        days.push(
          <button
            key={`day-${day.toISOString()}`}
            onClick={() => handleSelect(currentDay)}
            className={cn(
              "w-10 h-10 flex flex-col items-center justify-center rounded-full text-sm relative",
              isCurrentMonth ? "text-foreground" : "text-muted-foreground opacity-50",
              isToday && "bg-primary/10 font-medium",
              selectedDate && isSameDay(day, selectedDate) && "bg-primary text-primary-foreground",
              hasRental && !selectedDate && !isToday && "font-medium",
              "hover:bg-accent/80"
            )}
          >
            {day.getDate()}
            {hasRental && (
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
            )}
          </button>
        );
        
        day = addDays(day, 1);
      }
      
      rows.push(
        <div key={`row-${day.toISOString()}`} className="grid grid-cols-7 gap-0">
          {days}
        </div>
      );
      
      days = [];
    }

    return (
      <div className="calendar-month">
        <div className="text-center py-2 font-medium">
          {format(month, 'MMMM yyyy', { locale: es })}
        </div>
        <div className="grid gap-y-2">
          {rows}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-[640px]">
        <div className="border rounded-md p-2 bg-white">
          {generateCalendarDays(currentMonth)}
        </div>
        
        {!isMobile && (
          <div className="border rounded-md p-2 bg-white">
            {generateCalendarDays(nextMonth)}
          </div>
        )}
      </div>
    </div>
  );
};

export default RentalCalendar;
