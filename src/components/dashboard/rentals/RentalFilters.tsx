
import React, { useState } from 'react';
import { Search, Filter, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RentalFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  rentalId: string;
  onRentalIdChange: (value: string) => void;
  onSearch: (e: React.FormEvent) => void;
}

const RentalFilters = ({
  searchQuery,
  onSearchChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  rentalId,
  onRentalIdChange,
  onSearch
}: RentalFiltersProps) => {
  // State to track which date we're selecting (start or end)
  const [selectingDate, setSelectingDate] = useState<'start' | 'end'>('start');
  const [viewDate, setViewDate] = useState<Date>(new Date());
  
  // Format date for display
  const formatDisplayDate = (date: Date | undefined) => {
    return date ? format(date, 'dd/MM/yyyy', { locale: es }) : '';
  };

  // Navigation for months
  const navigateMonth = (direction: 'prev' | 'next') => {
    setViewDate(current => 
      direction === 'prev' ? subMonths(current, 1) : addMonths(current, 1)
    );
  };

  // Generate array of years for selection (10 years before and after current year)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-10 min-w-[200px]"
          />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-10">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Rango de fechas</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 min-w-[320px]">
            <div className="p-3 space-y-3">
              {/* Display selected dates */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Fecha inicio</p>
                  <Input 
                    value={formatDisplayDate(startDate)} 
                    readOnly 
                    onClick={() => setSelectingDate('start')}
                    className={cn(
                      "cursor-pointer",
                      selectingDate === 'start' && "ring-2 ring-primary"
                    )}
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Fecha fin</p>
                  <Input 
                    value={formatDisplayDate(endDate)} 
                    readOnly 
                    onClick={() => setSelectingDate('end')}
                    className={cn(
                      "cursor-pointer",
                      selectingDate === 'end' && "ring-2 ring-primary"
                    )}
                  />
                </div>
              </div>
              
              {/* Year selector with month navigation */}
              <div className="flex items-center justify-between mb-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigateMonth('prev')} 
                  className="h-7 w-7 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex gap-2">
                  <Select 
                    value={viewDate.getFullYear().toString()} 
                    onValueChange={(value) => {
                      const newDate = new Date(viewDate);
                      newDate.setFullYear(parseInt(value));
                      setViewDate(newDate);
                    }}
                  >
                    <SelectTrigger className="w-[100px]">
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
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigateMonth('next')} 
                  className="h-7 w-7 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-center text-sm font-medium mb-1">
                {format(viewDate, 'MMMM yyyy', { locale: es })}
              </div>
              
              {/* Calendar */}
              <CalendarComponent
                mode="range"
                selected={{
                  from: startDate,
                  to: endDate,
                }}
                onSelect={(range) => {
                  if (range?.from) {
                    onStartDateChange(range.from);
                  } else {
                    onStartDateChange(undefined);
                  }
                  if (range?.to) {
                    onEndDateChange(range.to);
                  } else {
                    onEndDateChange(undefined);
                  }
                  if (range?.from && !range?.to) {
                    setSelectingDate('end');
                  } else {
                    setSelectingDate('start');
                  }
                }}
                initialFocus
                locale={es}
                month={viewDate}
                onMonthChange={setViewDate}
                className={cn("p-3 pointer-events-auto")}
              />
              
              <div className="flex justify-between pt-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    onStartDateChange(undefined);
                    onEndDateChange(undefined);
                    setSelectingDate('start');
                  }}
                >
                  Limpiar
                </Button>
                
                <Button
                  size="sm"
                  onClick={() => {
                    // Close the popover by clicking outside
                    document.body.click();
                  }}
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <div className="relative">
          <Input
            placeholder="ID de alquiler"
            value={rentalId}
            onChange={(e) => onRentalIdChange(e.target.value)}
            className="w-32 h-10"
          />
        </div>
        
        <Button onClick={(e) => onSearch(e)} className="h-10">
          <Filter className="h-4 w-4 mr-2" />
          <span>Filtrar</span>
        </Button>
      </div>
    </div>
  );
};

export default RentalFilters;
