
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import RentalFilters from './RentalFilters';
import RentalCalendar from './RentalCalendar';
import RentalsList from './RentalsList';
import { useRentalsFilter } from '@/application/hooks/useRentalsFilter';
import { MOCK_RENTALS } from '@/infrastructure/adapters/mockData/rentals/mockRentalsData';

const RentalsManagement = () => {
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
  } = useRentalsFilter(MOCK_RENTALS);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold">Gestión de Alquileres</h1>
        <p className="text-muted-foreground">Seguimiento y gestión de todos los alquileres de equipos.</p>
      </div>
      
      {/* Search and filter */}
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
      
      {/* Calendar view */}
      <RentalCalendar 
        rentals={MOCK_RENTALS}
        onDateSelect={handleDateSelect}
      />
      
      {/* Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
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
        
        <TabsContent value="all" className="mt-6">
          <RentalsList rentals={filteredRentals} />
        </TabsContent>
        
        <TabsContent value="active" className="mt-6">
          <RentalsList rentals={filteredRentals} />
        </TabsContent>
        
        <TabsContent value="upcoming" className="mt-6">
          <RentalsList rentals={filteredRentals} />
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          <RentalsList rentals={filteredRentals} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RentalsManagement;
