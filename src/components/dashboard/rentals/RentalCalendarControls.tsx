
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
    <div className="flex flex-wrap justify-between items-center gap-2">
      <h3 className="text-lg font-medium">Calendario de alquileres</h3>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPreviousMonth} className="h-9">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onNextMonth} className="h-9">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button onClick={onCreateRental} className="flex items-center gap-2 h-9">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Crear alquiler</span>
          <span className="sm:hidden">Crear</span>
        </Button>
      </div>
    </div>
  );
};

export default RentalCalendarControls;
