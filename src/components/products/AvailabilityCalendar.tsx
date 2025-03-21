
import React, { useState } from 'react';
import { format, isWithinInterval, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { AvailabilityPeriod } from './ProductCard';

interface AvailabilityCalendarProps {
  availabilityPeriods: AvailabilityPeriod[];
  onSelectDateRange?: (startDate: Date, endDate: Date) => void;
}

const AvailabilityCalendar = ({ 
  availabilityPeriods, 
  onSelectDateRange 
}: AvailabilityCalendarProps) => {
  const [month, setMonth] = useState<Date>(new Date());
  const [selectedRange, setSelectedRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined
  });

  // Handle month navigation
  const handlePreviousMonth = () => {
    const previousMonth = new Date(month);
    previousMonth.setMonth(month.getMonth() - 1);
    setMonth(previousMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(month);
    nextMonth.setMonth(month.getMonth() + 1);
    setMonth(nextMonth);
  };

  // Check if a date is within any of the available periods
  const isDateAvailable = (date: Date) => {
    return availabilityPeriods.some(period => {
      if (period.status !== 'available') return false;
      
      const start = parseISO(period.startDate);
      const end = parseISO(period.endDate);
      
      return isWithinInterval(date, { start, end });
    });
  };

  // Check if a date is within any of the unavailable periods
  const isDateUnavailable = (date: Date) => {
    return availabilityPeriods.some(period => {
      if (period.status === 'available') return false;
      
      const start = parseISO(period.startDate);
      const end = parseISO(period.endDate);
      
      return isWithinInterval(date, { start, end });
    });
  };

  // Handle date selection for range picking
  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // If the date is not available, don't allow selection
    if (!isDateAvailable(date)) return;
    
    if (!selectedRange.from) {
      setSelectedRange({ from: date, to: undefined });
    } else if (!selectedRange.to) {
      // Make sure the end date is after the start date
      if (date < selectedRange.from) {
        setSelectedRange({ from: date, to: selectedRange.from });
      } else {
        setSelectedRange({ ...selectedRange, to: date });
        
        // Call the callback if provided
        if (onSelectDateRange) {
          onSelectDateRange(selectedRange.from, date);
        }
      }
    } else {
      // Reset selection and start new range
      setSelectedRange({ from: date, to: undefined });
    }
  };

  // Apply custom styling to dates based on availability
  const modifiers = {
    available: (date: Date) => isDateAvailable(date),
    unavailable: (date: Date) => isDateUnavailable(date),
    booked: (date: Date) => availabilityPeriods.some(period => {
      if (period.status !== 'rented') return false;
      
      const start = parseISO(period.startDate);
      const end = parseISO(period.endDate);
      
      return isWithinInterval(date, { start, end });
    }),
    pending: (date: Date) => availabilityPeriods.some(period => {
      if (period.status !== 'pending') return false;
      
      const start = parseISO(period.startDate);
      const end = parseISO(period.endDate);
      
      return isWithinInterval(date, { start, end });
    })
  };

  // Custom styling for different date types
  const modifiersClassNames = {
    available: "bg-green-50 text-green-900 hover:bg-green-100",
    unavailable: "bg-gray-100 text-gray-400 hover:bg-gray-100 cursor-not-allowed",
    booked: "bg-blue-50 text-blue-900 hover:bg-blue-100",
    pending: "bg-yellow-50 text-yellow-900 hover:bg-yellow-100"
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Disponibilidad</h3>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center px-3 py-1 font-medium">
            {format(month, 'MMMM yyyy', { locale: es })}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border">
        <Calendar
          mode="range"
          month={month}
          selected={selectedRange}
          onSelect={(value) => {
            if (!value) return;
            if ('from' in value) {
              setSelectedRange(value as any);
              if (value.from && value.to && onSelectDateRange) {
                onSelectDateRange(value.from, value.to);
              }
            }
          }}
          modifiers={modifiers}
          modifiersClassNames={modifiersClassNames}
          disabled={(date) => {
            // Disable dates in the past
            return date < new Date(new Date().setHours(0, 0, 0, 0));
          }}
          className="p-3 pointer-events-auto"
        />
      </div>
      
      <div className="flex flex-wrap gap-3 mt-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
          <span>Alquilado</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
          <span>Pendiente</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
          <span>No disponible</span>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
