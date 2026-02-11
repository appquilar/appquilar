import { useNavigate } from 'react-router-dom';
import { useRentalsData } from './useRentalsData';

export const useRentalsManagement = () => {
  const navigate = useNavigate();

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
    statusFilter,
    setStatusFilter,
    roleTab,
    setRoleTab,
    showRoleFilter,
    filteredRentals,
    handleSearch,
    handleDateSelect,
  } = useRentalsData();

  const handleCreateRental = () => {
    navigate('/dashboard/rentals/new');
  };

  const handleViewDetails = (rentalId: string) => {
    navigate(`/dashboard/rentals/${rentalId}`);
  };

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
    statusFilter,
    setStatusFilter,
    roleTab,
    setRoleTab,
    showRoleFilter,
    filteredRentals,
    handleSearch,
    handleCreateRental,
    handleViewDetails,
    handleDateSelect,
  };
};
