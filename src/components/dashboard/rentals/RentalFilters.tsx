
import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchField from './filters/SearchField';
import DateRangePicker from './filters/DateRangePicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RentalStatusFilter } from '@/domain/models/RentalFilters';

interface RentalFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  statusFilter: RentalStatusFilter;
  onStatusFilterChange: (status: RentalStatusFilter) => void;
  onSearch: (e: React.FormEvent) => void;
}

const RentalFilters = ({
  searchQuery,
  onSearchChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  statusFilter,
  onStatusFilterChange,
  onSearch
}: RentalFiltersProps) => {
  return (
    <div className="w-full">
      <div className="flex flex-col gap-2">
        <SearchField 
          value={searchQuery} 
          onChange={onSearchChange} 
          className="w-full"
        />
        
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
            className="w-full sm:w-auto"
          />

          <Select value={statusFilter} onValueChange={(value) => onStatusFilterChange(value as RentalStatusFilter)}>
            <SelectTrigger className="h-10 w-full sm:w-[220px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={(e) => onSearch(e)} className="h-10 w-full sm:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            <span>Filtrar</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RentalFilters;
