
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import RentalCalendar from './RentalCalendar';
import { useRentals } from '@/application/hooks/useRentals';

interface RentalCalendarControlsProps {
  onCreateRental: () => void;
  startDate?: Date;
  endDate?: Date;
}

const RentalCalendarControls = ({ onCreateRental, startDate, endDate }: RentalCalendarControlsProps) => {
  const { rentals } = useRentals();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  
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
      <div className="flex justify-between mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCalendar(!showCalendar)}
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          {showCalendar ? 'Ocultar calendario' : 'Mostrar calendario'}
        </Button>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handlePrevMonth} className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
          <Button variant="ghost" size="sm" onClick={handleNextMonth} className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button onClick={onCreateRental} size="sm" className="ml-4">
            <Plus className="h-4 w-4 mr-1" /> Nuevo Alquiler
          </Button>
        </div>
      </div>
      
      {showCalendar && (
        <RentalCalendar 
          rentals={rentals} 
          currentMonth={currentMonth} 
          onMonthChange={setCurrentMonth}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    </div>
  );
};

export default RentalCalendarControls;
