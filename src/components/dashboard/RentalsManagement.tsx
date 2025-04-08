
import { useNavigate } from 'react-router-dom';
import RentalFilters from './rentals/RentalFilters';
import RentalCalendar from './rentals/RentalCalendar';
import RentalCalendarControls from './rentals/RentalCalendarControls';
import RentalTabs from './rentals/RentalTabs';
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
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-display font-semibold">Gestión de Alquileres</h1>
        <p className="text-muted-foreground">Seguimiento y gestión de todos los alquileres de equipos.</p>
      </div>
      
      {/* Search and filter - more compact */}
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
      
      {/* Calendar section */}
      <div className="mt-6">
        <RentalCalendarControls 
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
          onCreateRental={handleCreateRental}
        />
        
        <RentalCalendar 
          rentals={rentals}
          onDateSelect={handleDateSelect}
          currentMonth={currentMonth}
          onMonthChange={handleMonthChange}
        />
      </div>
      
      {/* Tabs for filtering rentals */}
      <div className="mt-6">
        <RentalTabs 
          rentals={filteredRentals}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          rentalCounts={rentalCounts}
          onViewDetails={handleViewDetails}
        />
      </div>
    </div>
  );
};

export default RentalsManagement;
