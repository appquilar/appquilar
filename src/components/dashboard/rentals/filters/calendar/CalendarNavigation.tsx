
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CalendarNavigationProps {
  viewDate: Date;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

const CalendarNavigation = ({ 
  viewDate, 
  onNavigateMonth, 
  onMonthChange, 
  onYearChange 
}: CalendarNavigationProps) => {
  // Generate array of years for selection (10 years before and after current year)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  };

  // Generate array of months for selection
  const generateMonthOptions = () => {
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(2021, i, 1);
      return {
        value: i.toString(),
        label: format(date, 'MMMM', { locale: es })
      };
    });
  };

  return (
    <div className="flex items-center justify-between mb-2">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => onNavigateMonth('prev')} 
        className="h-7 w-7 p-0 flex-shrink-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex gap-2 justify-center flex-grow">
        <Select 
          value={viewDate.getFullYear().toString()} 
          onValueChange={(value) => onYearChange(parseInt(value))}
        >
          <SelectTrigger className="w-[90px]">
            <SelectValue placeholder="Año" />
          </SelectTrigger>
          <SelectContent>
            {generateYearOptions().map(year => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select 
          value={viewDate.getMonth().toString()} 
          onValueChange={(value) => onMonthChange(parseInt(value))}
        >
          <SelectTrigger className="w-[110px]">
            <SelectValue placeholder="Mes" />
          </SelectTrigger>
          <SelectContent>
            {generateMonthOptions().map(month => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => onNavigateMonth('next')} 
        className="h-7 w-7 p-0 flex-shrink-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CalendarNavigation;
