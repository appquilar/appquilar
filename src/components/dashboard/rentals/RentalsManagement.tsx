
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
    <div className="space-y-3">
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

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Calendario de alquileres</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button className="flex items-center gap-2 ml-2">
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
        
        {/* Calendar component with reduced padding and margin */}
        <div className="border rounded-lg p-3 my-3 max-w-[100%] overflow-x-auto">
          <RentalCalendar 
            rentals={rentals}
            onDateSelect={handleDateSelect}
          />
        </div>
        
        <TabsContent value="all" className="pt-2">
          <RentalContent rentals={filteredRentals} />
        </TabsContent>
        
        <TabsContent value="active" className="pt-2">
          <RentalContent rentals={filteredRentals} />
        </TabsContent>
        
        <TabsContent value="upcoming" className="pt-2">
          <RentalContent rentals={filteredRentals} />
        </TabsContent>
        
        <TabsContent value="completed" className="pt-2">
          <RentalContent rentals={filteredRentals} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RentalsManagement;
