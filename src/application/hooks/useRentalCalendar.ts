
import { useState } from 'react';

/**
 * A simplified hook for handling rental date selection
 */
export const useRentalCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    console.log('Selected date:', date);
  };
  
  return {
    selectedDate,
    handleDateSelect
  };
};
