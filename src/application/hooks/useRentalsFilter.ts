import { useState, useMemo } from 'react';
import { Rental } from '@/domain/models/Rental';
import { RentalCounts, RentalFilters, RentalRoleTab, RentalStatusFilter } from '@/domain/models/RentalFilters';
import { RentalFilterService } from '@/domain/services/RentalFilterService';

export interface UseRentalsFilterReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
  rentalId: string;
  setRentalId: (id: string) => void;
  statusFilter: RentalStatusFilter;
  setStatusFilter: (status: RentalStatusFilter) => void;
  roleTab: RentalRoleTab;
  setRoleTab: (tab: RentalRoleTab) => void;
  filteredRentals: Rental[];
  rentalCounts: RentalCounts;
  handleSearch: (e: React.FormEvent) => void;
  handleDateSelect: (date: Date) => void;
}

export const useRentalsFilter = (
  rentals: Rental[]
): UseRentalsFilterReturn => {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [rentalId, setRentalId] = useState('');
  const [statusFilter, setStatusFilter] = useState<RentalStatusFilter>('pending');
  const [roleTab, setRoleTab] = useState<RentalRoleTab>('owner');

  const filters: RentalFilters = useMemo(() => ({
    searchQuery,
    startDate,
    endDate,
    rentalId,
    statusFilter,
    roleTab,
  }), [searchQuery, startDate, endDate, rentalId, statusFilter, roleTab]);

  const rentalCounts = useMemo(() =>
    RentalFilterService.calculateRentalCounts(rentals),
    [rentals]
  );

  const filteredRentals = useMemo(() =>
    RentalFilterService.filterRentals(rentals, filters),
    [rentals, filters]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleDateSelect = (date: Date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(undefined);
    } else if (startDate && !endDate) {
      if (date < startDate) {
        setEndDate(startDate);
        setStartDate(date);
      } else {
        setEndDate(date);
      }
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    rentalId,
    setRentalId,
    statusFilter,
    setStatusFilter,
    roleTab,
    setRoleTab,
    filteredRentals,
    rentalCounts,
    handleSearch,
    handleDateSelect,
  };
};
