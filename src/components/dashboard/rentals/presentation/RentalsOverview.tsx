
import React from 'react';
import RentalsHeader from '../RentalsHeader';
import RentalFilters from '../RentalFilters';
import RentalCalendarControls from '../RentalCalendarControls';
import RentalTabs from '../RentalTabs';
import RentalsContainer from '../RentalsContainer';
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
    rentalId,
    setRentalId,
    activeTab,
    setActiveTab,
    filteredRentals,
    rentalCounts,
    handleSearch,
    handleCreateRental,
    handleViewDetails,
    handleDateSelect
  } = useRentalsManagement();
  
  return (
    <div className="space-y-4 max-w-full">
      {/* Header */}
      <RentalsHeader onCreateRental={handleCreateRental} />
      
      {/* Enhanced Filters */}
      <div className="flex justify-between items-center">
        <RentalFilters 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          rentalId={rentalId}
          onRentalIdChange={setRentalId}
          onSearch={handleSearch}
        />
      </div>
      
      {/* Calendar controls section */}
      <div className="flex flex-col space-y-2">
        <RentalCalendarControls 
          onCreateRental={handleCreateRental}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
      
      {/* Rental listing with loading and error handling */}
      <RentalsContainer isLoading={isLoading} error={error}>
        <RentalTabs 
          rentals={filteredRentals}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          rentalCounts={rentalCounts}
          onViewDetails={handleViewDetails}
        />
      </RentalsContainer>
    </div>
  );
};

export default RentalsOverview;
