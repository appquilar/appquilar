import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RentalRoleTabsProps {
  roleTab: 'owner' | 'renter';
  onRoleChange: (role: 'owner' | 'renter') => void;
}

const RentalRoleTabs: React.FC<RentalRoleTabsProps> = ({ roleTab, onRoleChange }) => {
  return (
    <Tabs value={roleTab} onValueChange={(value) => onRoleChange(value as 'owner' | 'renter')}>
      <TabsList className="grid grid-cols-2 w-full">
        <TabsTrigger value="owner">Propietario</TabsTrigger>
        <TabsTrigger value="renter">Arrendatario</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default RentalRoleTabs;
