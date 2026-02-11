import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Rental } from '@/domain/models/Rental';
import { RentalCategoryTab, RentalCounts } from '@/domain/models/RentalFilters';
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
  activeTab: RentalCategoryTab;
  onTabChange: (tab: RentalCategoryTab) => void;
  rentalCounts: RentalCounts;
  onViewDetails: (rentalId: string) => void;
  roleTab: 'owner' | 'renter';
}

const RentalTabs: React.FC<RentalTabsProps> = ({
  rentals,
  activeTab,
  onTabChange,
  rentalCounts,
  onViewDetails,
  roleTab
}) => {
  const isMobile = useIsMobile();

  const renderList = () => (
    <RentalsList rentals={rentals} onViewDetails={onViewDetails} roleTab={roleTab} />
  );

  if (isMobile) {
    return (
      <div className="space-y-4 w-full">
        <Select value={activeTab} onValueChange={(value) => onTabChange(value as RentalCategoryTab)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar filtro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="leads">
              <div className="flex items-center justify-between w-full">
                <span>Leads</span>
                <Badge variant="secondary">{rentalCounts.leads}</Badge>
              </div>
            </SelectItem>
            <SelectItem value="upcoming">
              <div className="flex items-center justify-between w-full">
                <span>Próximos</span>
                <Badge variant="secondary">{rentalCounts.upcoming}</Badge>
              </div>
            </SelectItem>
            <SelectItem value="past">
              <div className="flex items-center justify-between w-full">
                <span>Pasados</span>
                <Badge variant="secondary">{rentalCounts.past}</Badge>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <div className="mt-2">{renderList()}</div>
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as RentalCategoryTab)} className="w-full">
      <TabsList className="mb-2 grid grid-cols-3 w-full">
        <TabsTrigger value="leads" className="flex-1">
          Leads
          <Badge variant="secondary" className="ml-2">{rentalCounts.leads}</Badge>
        </TabsTrigger>
        <TabsTrigger value="upcoming" className="flex-1">
          Próximos
          <Badge variant="secondary" className="ml-2">{rentalCounts.upcoming}</Badge>
        </TabsTrigger>
        <TabsTrigger value="past" className="flex-1">
          Pasados
          <Badge variant="secondary" className="ml-2">{rentalCounts.past}</Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value={activeTab} className="mt-2">
        {renderList()}
      </TabsContent>
    </Tabs>
  );
};

export default RentalTabs;
