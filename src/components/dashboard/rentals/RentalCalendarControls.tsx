
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface RentalCalendarControlsProps {
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

const RentalCalendarControls: React.FC<RentalCalendarControlsProps> = ({
  onPreviousMonth,
  onNextMonth
}) => {
  return (
    <div className="flex flex-wrap justify-between items-center gap-2">
      <h3 className="text-lg font-medium">Calendario de alquileres</h3>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPreviousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Crear alquiler</span>
        </Button>
      </div>
    </div>
  );
};

export default RentalCalendarControls;
