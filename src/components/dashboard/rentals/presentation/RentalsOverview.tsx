
import React from 'react';
import RentalsHeader from '../RentalsHeader';
import RentalFilters from '../RentalFilters';
import RentalsList from '../RentalsList';
import RentalsContainer from '../RentalsContainer';
import RentalRoleTabs from '../RentalRoleTabs';
import { useRentalsManagement } from '../hooks/useRentalsManagement';

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
    handleSearch,
    handleCreateRental,
    handleViewDetails,
    handleDateSelect
  } = useRentalsManagement();
  
  return (
    <div className="space-y-4 max-w-full px-2 sm:px-0">
      {/* Header with create button */}
      <RentalsHeader onCreateRental={handleCreateRental} />
      
      {/* Enhanced Filters - more mobile friendly */}
      <div className="flex flex-col space-y-4">
        {showRoleFilter && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Tipo de alquiler</p>
            <RentalRoleTabs roleTab={roleTab} onRoleChange={setRoleTab} />
          </div>
        )}
        <RentalFilters 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onSearch={handleSearch}
        />
      </div>
      
      {/* Rental listing with loading and error handling */}
      <RentalsContainer isLoading={isLoading} error={error}>
        <RentalsList
          rentals={filteredRentals}
          onViewDetails={handleViewDetails}
          roleTab={roleTab}
        />
      </RentalsContainer>
    </div>
  );
};

export default RentalsOverview;
