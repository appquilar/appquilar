
import { useState, useMemo } from 'react';
import { Rental } from '@/domain/models/Rental';
import { RentalCounts, RentalFilters } from '@/domain/models/RentalFilters';
import { RentalService } from '@/domain/services/RentalService';

export interface UseRentalsFilterReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
  rentalId: string;
  setRentalId: (id: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filteredRentals: Rental[];
  rentalCounts: RentalCounts;
  handleSearch: (e: React.FormEvent) => void;
  handleDateSelect: (date: Date) => void;
}

export const useRentalsFilter = (rentals: Rental[]): UseRentalsFilterReturn => {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [rentalId, setRentalId] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Calculate counts of rentals by status using the domain service
  const rentalCounts = useMemo(() => 
    RentalService.calculateRentalCounts(rentals), 
    [rentals]
  );
  
  // Filter rentals based on all criteria using the domain service
  const filteredRentals = useMemo(() => 
    RentalService.filterRentals(
      rentals,
      searchQuery,
      rentalId,
      startDate,
      endDate,
      activeTab
    ), 
    [rentals, searchQuery, rentalId, startDate, endDate, activeTab]
  );
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we might call an API endpoint here
  };
  
  const handleDateSelect = (date: Date) => {
    console.log('Selected date:', date);
    // Set the selected date as both start and end for single-day filtering
    setStartDate(date);
    setEndDate(date);
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
    activeTab,
    setActiveTab,
    filteredRentals,
    rentalCounts,
    handleSearch,
    handleDateSelect
  };
};
