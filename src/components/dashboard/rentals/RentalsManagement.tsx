
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RentalFilters from './RentalFilters';
import RentalCalendar from './RentalCalendar';
import RentalCalendarControls from './RentalCalendarControls';
import RentalTabs from './RentalTabs';
import { useRentals } from '@/application/hooks/useRentals';
import { useRentalsFilter } from '@/application/hooks/useRentalsFilter';
import { useRentalCalendar } from '@/application/hooks/useRentalCalendar';

const RentalsManagement = () => {
  const navigate = useNavigate();
  
  // Fetch rentals data
  const { rentals, isLoading, error } = useRentals();
  
  // Filter and search functionality
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
    handleSearch
  } = useRentalsFilter(rentals);
  
  // Calendar functionality
  const {
    currentMonth,
    handleDateSelect,
    handleMonthChange,
    goToPreviousMonth,
    goToNextMonth
  } = useRentalCalendar();

  // Navigation handlers
  const handleCreateRental = () => {
    navigate('/dashboard/rentals/new');
  };

  const handleViewDetails = (rentalId: string) => {
    navigate(`/dashboard/rentals/${rentalId}`);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-md bg-destructive/10 text-destructive">
        {error}
      </div>
    );
  }
  
  return (
    <div className="space-y-4 max-w-full">
      {/* Header - Reduced vertical padding */}
      <div className="mb-2">
        <h1 className="text-2xl font-display font-semibold">Gestión de Alquileres</h1>
        <p className="text-muted-foreground">Seguimiento y gestión de todos los alquileres de equipos.</p>
      </div>
      
      {/* Filters - Compact design with reduced vertical space */}
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

      {/* Calendar section with tighter spacing */}
      <div className="flex flex-col space-y-2">
        <RentalCalendarControls 
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
          onCreateRental={handleCreateRental}
        />
        
        {/* Calendar with reduced padding */}
        <div className="border rounded-lg overflow-x-auto">
          <RentalCalendar 
            rentals={rentals}
            onDateSelect={handleDateSelect}
            currentMonth={currentMonth}
            onMonthChange={handleMonthChange}
          />
        </div>
      </div>
      
      {/* Tabs for filtering rentals - Reduced vertical margins */}
      <RentalTabs 
        rentals={filteredRentals}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        rentalCounts={rentalCounts}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
};

export default RentalsManagement;
