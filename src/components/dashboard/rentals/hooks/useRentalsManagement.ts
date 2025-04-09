
import { useNavigate } from 'react-router-dom';
import { useRentalsData } from './useRentalsData';

export const useRentalsManagement = () => {
  const navigate = useNavigate();
  
  // Use our rentals data hook for fetching and filtering
  const {
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
  } = useRentalsData();

  // Navigation handlers
  const handleCreateRental = () => {
    navigate('/dashboard/rentals/new');
  };

  const handleViewDetails = (rentalId: string) => {
    navigate(`/dashboard/rentals/${rentalId}`);
  };
  
  return {
    // Data and loading states
    rentals,
    isLoading,
    error,
    
    // Filter states
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
    
    // Event handlers
    handleSearch,
    handleCreateRental,
    handleViewDetails,
    handleDateSelect
  };
};
