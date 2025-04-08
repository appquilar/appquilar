
import { useState } from 'react';

// This hook is simplified since we no longer use the calendar view
export const useRentalCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    console.log('Selected date:', date);
    // The filtering is now handled in the useRentalsFilter hook
  };
  
  return {
    selectedDate,
    handleDateSelect,
  };
};
