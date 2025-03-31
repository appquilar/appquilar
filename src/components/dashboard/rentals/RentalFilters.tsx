
import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <form onSubmit={onSearch} className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </form>
      
      <div className="flex flex-wrap gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-10">
              {startDate ? format(startDate, 'dd/MM/yyyy') : 'Fecha inicio'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={onStartDateChange}
              initialFocus
              locale={es}
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-10">
              {endDate ? format(endDate, 'dd/MM/yyyy') : 'Fecha fin'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={onEndDateChange}
              initialFocus
              locale={es}
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        
        <Input
          placeholder="ID de alquiler"
          value={rentalId}
          onChange={(e) => onRentalIdChange(e.target.value)}
          className="w-32 h-10"
        />
        
        <Button type="submit" onClick={(e) => onSearch(e)} className="gap-2 h-10">
          <Search size={16} />
          Buscar
        </Button>
      </div>
    </div>
  );
};

export default RentalFilters;
