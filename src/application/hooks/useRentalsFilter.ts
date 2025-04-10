import { useState, useMemo } from 'react';
import { Rental } from '@/domain/models/Rental';
import { RentalCounts, RentalFilters } from '@/domain/models/RentalFilters';
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
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filteredRentals: Rental[];
  rentalCounts: RentalCounts;
  handleSearch: (e: React.FormEvent) => void;
  handleDateSelect: (date: Date) => void;
}

export const useRentalsFilter = (rentals: Rental[]): UseRentalsFilterReturn => {
  // State for filter criteria
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [rentalId, setRentalId] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Filter state object for the domain service
  const filters: RentalFilters = useMemo(() => ({
    searchQuery,
    startDate,
    endDate,
    rentalId,
    activeTab
  }), [searchQuery, startDate, endDate, rentalId, activeTab]);
  
  // Calculate counts of rentals by status using the domain service
  const rentalCounts = useMemo(() => 
    RentalFilterService.calculateRentalCounts(rentals), 
    [rentals]
  );
  
  // Filter rentals based on all criteria using the domain service
  const filteredRentals = useMemo(() => 
    RentalFilterService.filterRentals(rentals, filters), 
    [rentals, filters]
  );
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we might call an API endpoint here
  };
  
  const handleDateSelect = (date: Date) => {
    // If we have no start date, or we have both start and end dates, set as start date
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(undefined);
    } 
    // If we have start date but no end date
    else if (startDate && !endDate) {
      // If selected date is before start date, make it the start and the old start the end
      if (date < startDate) {
        setEndDate(startDate);
        setStartDate(date);
      } else {
        // Otherwise set it as end date
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
    activeTab,
    setActiveTab,
    filteredRentals,
    rentalCounts,
    handleSearch,
    handleDateSelect
  };
};
