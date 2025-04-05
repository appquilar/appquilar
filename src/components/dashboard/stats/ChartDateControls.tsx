
import React from 'react';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface ChartDateControlsProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectMonth: (date: Date | undefined) => void;
  calendarOpen: boolean;
  setCalendarOpen: (open: boolean) => void;
  isMobile: boolean;
}

const ChartDateControls: React.FC<ChartDateControlsProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onSelectMonth,
  calendarOpen,
  setCalendarOpen,
  isMobile
}) => {
  return (
    <div className={`flex items-center ${isMobile ? "self-start" : "space-x-2"} gap-2`}>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={onPrevMonth}
        aria-label="Mes anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>{format(currentDate, 'MMMM yyyy', { locale: es })}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            selected={currentDate}
            onSelect={onSelectMonth}
            initialFocus
            locale={es}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={onNextMonth}
        aria-label="Mes siguiente"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ChartDateControls;
