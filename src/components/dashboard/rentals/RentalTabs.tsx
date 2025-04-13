
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Rental } from '@/domain/models/Rental';
import { RentalCounts } from '@/domain/models/RentalFilters';
import RentalsList from './RentalsList';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  // Render a select dropdown for mobile
  if (isMobile) {
    return (
      <div className="space-y-4 w-full">
        <Select value={activeTab} onValueChange={onTabChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar estado">
              {activeTab === 'all' && <>Todos <Badge className="ml-2">{rentalCounts.all}</Badge></>}
              {activeTab === 'active' && <>Activos <Badge className="ml-2">{rentalCounts.active}</Badge></>}
              {activeTab === 'upcoming' && <>Próximos <Badge className="ml-2">{rentalCounts.upcoming}</Badge></>}
              {activeTab === 'completed' && <>Completados <Badge className="ml-2">{rentalCounts.completed}</Badge></>}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center justify-between w-full">
                <span>Todos</span>
                <Badge variant="secondary">{rentalCounts.all}</Badge>
              </div>
            </SelectItem>
            <SelectItem value="active">
              <div className="flex items-center justify-between w-full">
                <span>Activos</span>
                <Badge variant="secondary">{rentalCounts.active}</Badge>
              </div>
            </SelectItem>
            <SelectItem value="upcoming">
              <div className="flex items-center justify-between w-full">
                <span>Próximos</span>
                <Badge variant="secondary">{rentalCounts.upcoming}</Badge>
              </div>
            </SelectItem>
            <SelectItem value="completed">
              <div className="flex items-center justify-between w-full">
                <span>Completados</span>
                <Badge variant="secondary">{rentalCounts.completed}</Badge>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <div className="mt-2">
          {activeTab === "all" && <RentalsList rentals={rentals} onViewDetails={onViewDetails} />}
          {activeTab === "active" && <RentalsList rentals={rentals} onViewDetails={onViewDetails} />}
          {activeTab === "upcoming" && <RentalsList rentals={rentals} onViewDetails={onViewDetails} />}
          {activeTab === "completed" && <RentalsList rentals={rentals} onViewDetails={onViewDetails} />}
        </div>
      </div>
    );
  }

  // Desktop view with tabs
  return (
    <Tabs defaultValue="all" value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="mb-2 grid grid-cols-4 w-full">
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
