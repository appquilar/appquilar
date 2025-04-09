
import React from 'react';

interface RentalsHeaderProps {
  onCreateRental: () => void;
}

const RentalsHeader = ({ onCreateRental }: RentalsHeaderProps) => {
  return (
    <div className="mb-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold">Gestión de Alquileres</h1>
          <p className="text-muted-foreground">Seguimiento y gestión de todos los alquileres de equipos.</p>
        </div>
        <button 
          onClick={onCreateRental}
          className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary/90"
        >
          <span className="hidden sm:inline">Crear alquiler</span>
          <span className="sm:hidden">+</span>
        </button>
      </div>
    </div>
  );
};

export default RentalsHeader;
