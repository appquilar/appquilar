
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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
      
      {/* Calendar view and tabs in a more compact layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar on the left (2/3 width on large screens) */}
        <div className="lg:col-span-2">
          <RentalCalendar 
            rentals={rentals}
            onDateSelect={handleDateSelect}
          />
        </div>
        
        {/* Create rental button on the right (1/3 width on large screens) */}
        <div className="flex items-start justify-center lg:justify-end">
          <Button className="flex items-center gap-2 w-full lg:w-auto">
            <Plus className="h-4 w-4" />
            <span>Crear alquiler</span>
          </Button>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
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
          <RentalContent rentals={filteredRentals} />
        </TabsContent>
        
        <TabsContent value="active" className="mt-6">
          <RentalContent rentals={filteredRentals} />
        </TabsContent>
        
        <TabsContent value="upcoming" className="mt-6">
          <RentalContent rentals={filteredRentals} />
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          <RentalContent rentals={filteredRentals} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RentalsManagement;
