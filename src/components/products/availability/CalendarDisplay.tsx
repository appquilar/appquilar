
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { isDateAvailable, isDateUnavailable } from './availabilityUtils';
import { AvailabilityPeriod } from '@/domain/models/Product';

interface CalendarDisplayProps {
  month: Date;
  selectedRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  onSelect: (value: any) => void;
  availabilityPeriods: AvailabilityPeriod[];
  isAlwaysAvailable: boolean;
  unavailableDates: string[];
}

const CalendarDisplay = ({
  month,
  selectedRange,
  onSelect,
  availabilityPeriods,
  isAlwaysAvailable,
  unavailableDates
}: CalendarDisplayProps) => {
  // Apply custom styling to dates based on availability
  const modifiers = {
    available: (date: Date) => isDateAvailable(date, availabilityPeriods, isAlwaysAvailable, unavailableDates),
    unavailable: (date: Date) => isDateUnavailable(date, availabilityPeriods, isAlwaysAvailable, unavailableDates),
    weekend: (date: Date) => date.getDay() === 0 || date.getDay() === 6
  };

  // Custom styling for different date types
  const modifiersClassNames = {
    available: "bg-green-50 text-green-900 hover:bg-green-100",
    unavailable: "bg-gray-100 text-gray-400 hover:bg-gray-100 cursor-not-allowed",
    weekend: ""  // Additional styling can be added here if needed
  };

  return (
    <div className="bg-white p-4 rounded-lg border">
      <Calendar
        mode="range"
        month={month}
        selected={selectedRange}
        onSelect={onSelect}
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        disabled={(date) => {
          // Disable dates in the past
          return date < new Date(new Date().setHours(0, 0, 0, 0));
        }}
        className="p-3"
      />
    </div>
  );
};

export default CalendarDisplay;
