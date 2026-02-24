
import React from 'react';
import RentalsHeader from '../RentalsHeader';
import RentalFilters from '../RentalFilters';
import RentalsList from '../RentalsList';
import RentalsContainer from '../RentalsContainer';
import { useRentalsManagement } from '../hooks/useRentalsManagement';
import ProductPagination from '@/components/dashboard/products/ProductPagination';

/**
 * Main rentals overview component that serves as the page container
 */
const RentalsOverview = () => {
  const {
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    statusFilter,
    setStatusFilter,
    roleTab,
    setRoleTab,
    showRoleFilter,
    filteredRentals,
    currentPage,
    totalPages,
    handlePageChange,
    handleCreateRental,
    handleViewDetails,
  } = useRentalsManagement();
  
  return (
    <div className="space-y-6 max-w-full">
      {/* Header with create button */}
      <RentalsHeader onCreateRental={handleCreateRental} />
      
      <RentalFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        showRoleFilter={showRoleFilter}
        roleTab={roleTab}
        onRoleChange={setRoleTab}
      />
      
      {/* Rental listing with loading and error handling */}
      <RentalsContainer isLoading={isLoading} error={error}>
        <RentalsList
          rentals={filteredRentals}
          onViewDetails={handleViewDetails}
          roleTab={roleTab}
        />
        <ProductPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </RentalsContainer>
    </div>
  );
};

export default RentalsOverview;
