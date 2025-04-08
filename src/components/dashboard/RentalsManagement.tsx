
import { useNavigate } from 'react-router-dom';
import RentalFilters from './rentals/RentalFilters';
import RentalTabs from './rentals/RentalTabs';
import { useRentals } from '@/application/hooks/useRentals';
import { useRentalsFilter } from '@/application/hooks/useRentalsFilter';

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
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-display font-semibold">Gestión de Alquileres</h1>
        <p className="text-muted-foreground">Seguimiento y gestión de todos los alquileres de equipos.</p>
      </div>
      
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
        
        <button 
          onClick={handleCreateRental}
          className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary/90"
        >
          <span className="hidden sm:inline">Crear alquiler</span>
          <span className="sm:hidden">+</span>
        </button>
      </div>
      
      {/* Tabs for filtering rentals */}
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
