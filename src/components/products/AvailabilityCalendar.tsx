
import React, { useState } from 'react';
import { AvailabilityPeriod } from '@/domain/models/Product';
import CalendarNavigation from './availability/CalendarNavigation';
import AlwaysAvailableNotice from './availability/AlwaysAvailableNotice';
import CalendarDisplay from './availability/CalendarDisplay';
import CalendarLegend from './availability/CalendarLegend';

interface AvailabilityCalendarProps {
  availabilityPeriods?: AvailabilityPeriod[];
  isAlwaysAvailable?: boolean;
  unavailableDates?: string[];
  onSelectDateRange?: (startDate: Date, endDate: Date) => void;
}

const AvailabilityCalendar = ({ 
  availabilityPeriods = [], 
  isAlwaysAvailable = false,
  unavailableDates = [],
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

  // Handle date selection for range picking
  const handleSelect = (value: any) => {
    if (!value) return;
    
    if ('from' in value) {
      setSelectedRange(value as any);
      if (value.from && value.to && onSelectDateRange) {
        onSelectDateRange(value.from, value.to);
      }
    }
  };

  return (
    <div className="w-full">
      <CalendarNavigation 
        month={month}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
      />
      
      {isAlwaysAvailable ? (
        <AlwaysAvailableNotice />
      ) : (
        <CalendarDisplay 
          month={month}
          selectedRange={selectedRange}
          onSelect={handleSelect}
          availabilityPeriods={availabilityPeriods}
          isAlwaysAvailable={isAlwaysAvailable}
          unavailableDates={unavailableDates}
        />
      )}
      
      <CalendarLegend />
    </div>
  );
};

export default AvailabilityCalendar;
