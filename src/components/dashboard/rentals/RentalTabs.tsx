
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Rental } from '@/domain/models/Rental';
import { RentalCounts } from '@/domain/models/RentalFilters';
import RentalsList from './RentalsList';

interface RentalTabsProps {
  rentals: Rental[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  rentalCounts: RentalCounts;
  onViewDetails: (rentalId: string) => void;
}

const RentalTabs: React.FC<RentalTabsProps> = ({
  rentals,
  activeTab,
  onTabChange,
  rentalCounts,
  onViewDetails
}) => {
  return (
    <Tabs defaultValue="all" value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="mb-2 grid grid-cols-2 md:grid-cols-4 md:flex md:flex-wrap w-full">
        <TabsTrigger value="all" className="flex-1">
          Todos
          <Badge variant="secondary" className="ml-2">{rentalCounts.all}</Badge>
        </TabsTrigger>
        <TabsTrigger value="active" className="flex-1">
          Activos
          <Badge variant="secondary" className="ml-2">{rentalCounts.active}</Badge>
        </TabsTrigger>
        <TabsTrigger value="upcoming" className="flex-1">
          Próximos
          <Badge variant="secondary" className="ml-2">{rentalCounts.upcoming}</Badge>
        </TabsTrigger>
        <TabsTrigger value="completed" className="flex-1">
          Completados
          <Badge variant="secondary" className="ml-2">{rentalCounts.completed}</Badge>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="mt-2">
        <RentalsList rentals={rentals} onViewDetails={onViewDetails} />
      </TabsContent>
      
      <TabsContent value="active" className="mt-2">
        <RentalsList rentals={rentals} onViewDetails={onViewDetails} />
      </TabsContent>
      
      <TabsContent value="upcoming" className="mt-2">
        <RentalsList rentals={rentals} onViewDetails={onViewDetails} />
      </TabsContent>
      
      <TabsContent value="completed" className="mt-2">
        <RentalsList rentals={rentals} onViewDetails={onViewDetails} />
      </TabsContent>
    </Tabs>
  );
};

export default RentalTabs;
