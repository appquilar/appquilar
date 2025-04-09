
import React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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
  const [selectingDate, setSelectingDate] = React.useState<'start' | 'end'>('start');
  
  // Handle date selection - alternate between start and end dates
  const handleDateSelect = (date: Date | undefined) => {
    if (selectingDate === 'start') {
      onStartDateChange(date);
      setSelectingDate('end');
    } else {
      onEndDateChange(date);
      setSelectingDate('start');
    }
  };

  // Format date range for display
  const getDateRangeLabel = () => {
    if (startDate && endDate) {
      return `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`;
    }
    if (startDate) {
      return `${format(startDate, 'dd/MM/yyyy')} - Seleccionar`;
    }
    return 'Rango de fechas';
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
              {getDateRangeLabel()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <div className="p-3">
              <div className="mb-2 text-sm font-medium">
                {selectingDate === 'start' ? 'Seleccionar fecha inicio' : 'Seleccionar fecha fin'}
              </div>
              <CalendarComponent
                mode="single"
                selected={selectingDate === 'start' ? startDate : endDate}
                onSelect={handleDateSelect}
                initialFocus
                locale={es}
                className="p-3"
                disabled={(date) => {
                  // When selecting end date, disable dates before start date
                  if (selectingDate === 'end' && startDate) {
                    return date < startDate;
                  }
                  return false;
                }}
              />
              <div className="flex justify-between pt-2 border-t mt-2">
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
                    // Toggle which date we're selecting
                    setSelectingDate(selectingDate === 'start' ? 'end' : 'start');
                  }}
                >
                  {selectingDate === 'start' ? 'Siguiente' : 'Anterior'}
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
