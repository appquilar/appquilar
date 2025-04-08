
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface RentalCalendarControlsProps {
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onCreateRental: () => void;
}

const RentalCalendarControls: React.FC<RentalCalendarControlsProps> = ({
  onPreviousMonth,
  onNextMonth,
  onCreateRental
}) => {
  return (
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-lg font-medium">Calendario de alquileres</h3>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPreviousMonth} className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onNextMonth} className="h-8 w-8">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button onClick={onCreateRental} className="flex items-center gap-2 h-8 px-3">
          <Plus className="h-4 w-4" />
          <span>Crear alquiler</span>
        </Button>
      </div>
    </div>
  );
};

export default RentalCalendarControls;
