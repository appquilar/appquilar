
import { useState } from 'react';
import { useRentals } from '@/application/hooks/useRentals';
import { useRentalsFilter } from '@/application/hooks/useRentalsFilter';

export const useRentalsData = () => {
  const { rentals, isLoading, error } = useRentals();
  
  const {
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
  } = useRentalsFilter(rentals);

  return {
    rentals,
    isLoading,
    error,
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
