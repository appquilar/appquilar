
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
      <div className="flex flex-col sm:flex-row flex-wrap gap-2">
        <SearchField 
          value={searchQuery} 
          onChange={onSearchChange} 
          className="w-full sm:w-auto"
        />
        
        <div className="flex gap-2 flex-wrap">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
          />
          
          <RentalIdField 
            value={rentalId}
            onChange={onRentalIdChange}
          />
          
          <Button onClick={(e) => onSearch(e)} className="h-10">
            <Filter className="h-4 w-4 mr-2" />
            <span>Filtrar</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RentalFilters;
