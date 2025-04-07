
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import RentalFilters from './RentalFilters';
import RentalCalendar from './RentalCalendar';
import RentalContent from './RentalContent';
import { useRentalsData } from './hooks/useRentalsData';

const RentalsManagement = () => {
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
  
  // State for calendar current month
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
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
      <div>
        <h1 className="text-2xl font-display font-semibold">Gestión de Alquileres</h1>
        <p className="text-muted-foreground">Seguimiento y gestión de todos los alquileres de equipos.</p>
      </div>
      
      {/* Filters */}
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

      {/* Tabs and Controls */}
      <div className="flex flex-col space-y-4">
        {/* Header with Navigation and Create Button */}
        <div className="flex flex-wrap justify-between items-center gap-2">
          <h3 className="text-lg font-medium">Calendario de alquileres</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Crear alquiler</span>
            </Button>
          </div>
        </div>
        
        {/* Tabs and Calendar */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-2">
            <TabsTrigger value="all">
              Todos
              <Badge variant="secondary" className="ml-2">{rentalCounts.all}</Badge>
            </TabsTrigger>
            <TabsTrigger value="active">
              Activos
              <Badge variant="secondary" className="ml-2">{rentalCounts.active}</Badge>
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Próximos
              <Badge variant="secondary" className="ml-2">{rentalCounts.upcoming}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completados
              <Badge variant="secondary" className="ml-2">{rentalCounts.completed}</Badge>
            </TabsTrigger>
          </TabsList>
          
          {/* Calendar - wrapped in a border with minimal padding */}
          <div className="border rounded-lg p-2 mb-4 overflow-x-auto">
            <RentalCalendar 
              rentals={rentals}
              onDateSelect={handleDateSelect}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
            />
          </div>
          
          {/* Rental Content based on selected tab */}
          <TabsContent value="all">
            <RentalContent rentals={filteredRentals} />
          </TabsContent>
          
          <TabsContent value="active">
            <RentalContent rentals={filteredRentals} />
          </TabsContent>
          
          <TabsContent value="upcoming">
            <RentalContent rentals={filteredRentals} />
          </TabsContent>
          
          <TabsContent value="completed">
            <RentalContent rentals={filteredRentals} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RentalsManagement;
