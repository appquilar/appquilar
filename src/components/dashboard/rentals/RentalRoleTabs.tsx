import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RentalRoleTabsProps {
  roleTab: 'owner' | 'renter';
  onRoleChange: (role: 'owner' | 'renter') => void;
}

const RentalRoleTabs: React.FC<RentalRoleTabsProps> = ({ roleTab, onRoleChange }) => {
  return (
    <Tabs value={roleTab} onValueChange={(value) => onRoleChange(value as 'owner' | 'renter')}>
      <TabsList className="grid h-10 w-full grid-cols-2 rounded-md border border-input bg-muted/35 p-1">
        <TabsTrigger value="owner" className="h-8 rounded-md text-sm">Propietario</TabsTrigger>
        <TabsTrigger value="renter" className="h-8 rounded-md text-sm">Arrendatario</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default RentalRoleTabs;
