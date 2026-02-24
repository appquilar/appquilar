
import React from 'react';
import SearchField from './filters/SearchField';
import DateRangePicker from './filters/DateRangePicker';
import RentalRoleTabs from './RentalRoleTabs';
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
  showRoleFilter: boolean;
  roleTab: 'owner' | 'renter';
  onRoleChange: (role: 'owner' | 'renter') => void;
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
  showRoleFilter,
  roleTab,
  onRoleChange,
}: RentalFiltersProps) => {
  return (
    <div className="dashboard-filter-panel w-full">
      <div className="dashboard-filter-grid">
        {showRoleFilter && (
          <div className="space-y-2 md:col-span-2 xl:col-span-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0F172A]/55">
              Tipo de alquiler
            </p>
            <RentalRoleTabs roleTab={roleTab} onRoleChange={onRoleChange} />
          </div>
        )}
        <SearchField 
          value={searchQuery} 
          onChange={onSearchChange} 
          className="md:col-span-2"
        />

        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
          className="w-full"
        />

        <Select value={statusFilter} onValueChange={(value) => onStatusFilterChange(value as RentalStatusFilter)}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
            <SelectItem value="completed">Completados</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default RentalFilters;
