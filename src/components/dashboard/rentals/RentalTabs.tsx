
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
}

const RentalTabs: React.FC<RentalTabsProps> = ({
  rentals,
  activeTab,
  onTabChange,
  rentalCounts,
}) => {
  return (
    <Tabs defaultValue="all" value={activeTab} onValueChange={onTabChange}>
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
        <RentalsList rentals={rentals} />
      </TabsContent>
      
      <TabsContent value="active" className="mt-6">
        <RentalsList rentals={rentals} />
      </TabsContent>
      
      <TabsContent value="upcoming" className="mt-6">
        <RentalsList rentals={rentals} />
      </TabsContent>
      
      <TabsContent value="completed" className="mt-6">
        <RentalsList rentals={rentals} />
      </TabsContent>
    </Tabs>
  );
};

export default RentalTabs;
