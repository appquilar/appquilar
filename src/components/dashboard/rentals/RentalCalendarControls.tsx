
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface RentalCalendarControlsProps {
  onCreateRental: () => void;
}

const RentalCalendarControls: React.FC<RentalCalendarControlsProps> = ({
  onCreateRental
}) => {
  return (
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-lg font-medium">Alquileres disponibles</h3>
      <Button onClick={onCreateRental} className="flex items-center gap-2 h-8 px-3">
        <Plus className="h-4 w-4" />
        <span>Crear alquiler</span>
      </Button>
    </div>
  );
};

export default RentalCalendarControls;
