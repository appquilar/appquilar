
import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarNavigationProps {
  month: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

const CalendarNavigation = ({
  month,
  onPreviousMonth,
  onNextMonth
}: CalendarNavigationProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-medium">Disponibilidad</h3>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onPreviousMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center px-3 py-1 font-medium">
          {format(month, 'MMMM yyyy', { locale: es })}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={onNextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CalendarNavigation;
