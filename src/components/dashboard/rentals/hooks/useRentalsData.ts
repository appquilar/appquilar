
import { useRentals } from '@/application/hooks/useRentals';
import { useRentalsFilter } from '@/application/hooks/useRentalsFilter';

export const useRentalsData = () => {
  // Get base rental data from the repository
  const { rentals, isLoading, error } = useRentals();
  
  // Use the specialized filter hook to handle all filtering logic
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
    // Data and loading states
    rentals,
    isLoading,
    error,
    
    // Filter states and setters
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
    
    // Filtered data and counts
    filteredRentals,
    rentalCounts,
    
    // Actions
    handleSearch,
    handleDateSelect
  };
};
