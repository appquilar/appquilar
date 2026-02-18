
import React from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardSectionHeader from '@/components/dashboard/common/DashboardSectionHeader';

interface RentalsHeaderProps {
  onCreateRental: () => void;
}

const RentalsHeader = ({ onCreateRental }: RentalsHeaderProps) => {
  return (
    <div className="relative">
      <DashboardSectionHeader
        title="Alquileres"
        description="Seguimiento y gestión de todos los alquileres de equipos."
        icon={Calendar}
        actions={(
          <Button
            onClick={onCreateRental}
            className="hidden sm:flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Crear alquiler</span>
          </Button>
        )}
      />
      
      {/* Fixed button for mobile */}
      <div className="sm:hidden fixed bottom-4 right-4 z-10">
        <Button 
          onClick={onCreateRental}
          className="bg-primary text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-primary/90"
          size="lg"
        >
          <Plus size={20} />
          <span>Crear alquiler</span>
        </Button>
      </div>
    </div>
  );
};

export default RentalsHeader;
