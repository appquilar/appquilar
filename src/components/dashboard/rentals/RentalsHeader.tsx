
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RentalsHeaderProps {
  onCreateRental: () => void;
}

const RentalsHeader = ({ onCreateRental }: RentalsHeaderProps) => {
  return (
    <div className="mb-2 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold">Gestión de Alquileres</h1>
          <p className="text-muted-foreground">Seguimiento y gestión de todos los alquileres de equipos.</p>
        </div>
        <Button 
          onClick={onCreateRental}
          className="bg-primary text-white px-4 py-2 rounded-md hidden sm:flex items-center gap-2 hover:bg-primary/90"
        >
          <Plus size={16} />
          <span>Crear alquiler</span>
        </Button>
      </div>
      
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
