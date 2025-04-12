
import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchField from './filters/SearchField';
import DateRangePicker from './filters/DateRangePicker';
import RentalIdField from './filters/RentalIdField';

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
          
          <RentalIdField 
            value={rentalId}
            onChange={onRentalIdChange}
            className="w-full sm:w-auto"
          />
          
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
