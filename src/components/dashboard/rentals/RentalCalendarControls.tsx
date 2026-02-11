
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import RentalCalendar from './RentalCalendar';
import { useRentals } from '@/application/hooks/useRentals';
import { useIsMobile } from '@/hooks/use-mobile';

interface RentalCalendarControlsProps {
  onCreateRental: () => void;
  startDate?: Date;
  endDate?: Date;
}

const formatMonthYear = (date: Date): string =>
  `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

const RentalCalendarControls = ({ onCreateRental, startDate, endDate }: RentalCalendarControlsProps) => {
  const { rentals } = useRentals();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const isMobile = useIsMobile();
  
  const handlePrevMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };
  
  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between mb-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCalendar(!showCalendar)}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Calendar className="h-4 w-4" />
          {showCalendar ? 'Ocultar calendario' : 'Mostrar calendario'}
        </Button>
        
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={handlePrevMonth} className="h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {formatMonthYear(currentMonth)}
            </span>
            <Button variant="ghost" size="sm" onClick={handleNextMonth} className="h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button onClick={onCreateRental} size="sm" className="sm:ml-4">
            <Plus className="h-4 w-4 mr-1" /> {isMobile ? '' : 'Nuevo Alquiler'}
          </Button>
        </div>
      </div>
      
      {showCalendar && (
        <div className="mt-3">
          <RentalCalendar 
            rentals={rentals} 
            currentMonth={currentMonth} 
            onMonthChange={setCurrentMonth}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      )}
    </div>
  );
};

export default RentalCalendarControls;
