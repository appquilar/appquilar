
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, isSameDay, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { CaptionProps } from 'react-day-picker';

interface RentalCalendarProps {
  rentals: any[]; // Replace with proper rental type
  onDateSelect?: (date: Date) => void;
}

const RentalCalendar = ({ rentals, onDateSelect }: RentalCalendarProps) => {
  const today = new Date();
  const [currentMonthDate, setCurrentMonthDate] = useState(startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Navigate to previous months
  const goToPreviousMonths = () => {
    setCurrentMonthDate(prevDate => subMonths(prevDate, isMobile ? 1 : 2));
  };

  // Navigate to next months
  const goToNextMonths = () => {
    setCurrentMonthDate(prevDate => addMonths(prevDate, isMobile ? 1 : 2));
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
        {hasRental ? (
          <div className="w-7 h-7 absolute bg-gray-200 rounded-full flex items-center justify-center">
            {day.getDate()}
          </div>
        ) : (
          day.getDate()
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Calendario de alquileres</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousMonths}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextMonths}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className={cn(
        "grid gap-6 border rounded-lg p-4",
        isMobile ? "grid-cols-1" : "grid-cols-2"
      )}>
        <div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            month={currentMonthDate}
            locale={es}
            className="p-3 pointer-events-auto"
            components={{
              DayContent: ({ date }) => renderDay(date),
              IconLeft: () => null,
              IconRight: () => null,
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
              month={addMonths(currentMonthDate, 1)}
              locale={es}
              className="p-3 pointer-events-auto"
              components={{
                DayContent: ({ date }) => renderDay(date),
                IconLeft: () => null,
                IconRight: () => null,
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
