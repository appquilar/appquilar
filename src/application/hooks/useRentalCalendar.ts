
import { useState } from 'react';

export const useRentalCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const handleDateSelect = (date: Date) => {
    console.log('Selected date:', date);
    // Implement logic to filter rentals for the selected date
  };
  
  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };
  
  return {
    currentMonth,
    handleDateSelect,
    handleMonthChange,
    goToPreviousMonth,
    goToNextMonth
  };
};
