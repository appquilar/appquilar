
import React from 'react';
import { Truck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Rental } from '@/domain/models/Rental';

interface RentalsListProps {
  rentals: Rental[];
  onViewDetails: (rentalId: string) => void;
}

const RentalsList = ({ rentals, onViewDetails }: RentalsListProps) => {
  if (rentals.length === 0) {
    return (
      <div className="text-center py-6">
        <Truck size={40} className="mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-1">No se encontraron alquileres</h3>
        <p className="text-muted-foreground">Prueba ajustando tu búsqueda o filtros.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {rentals.map((rental) => (
        <Card key={rental.id} className="hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between py-3 px-4">
            <div>
              <CardTitle className="text-base font-medium">{rental.product}</CardTitle>
              <p className="text-sm text-muted-foreground">Alquiler #{rental.id}</p>
            </div>
            <Badge
              className={`${
                rental.status === 'active' 
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' 
                  : rental.status === 'upcoming'
                    ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
              }`}
            >
              {rental.status === 'active' 
                ? 'Activo' 
                : rental.status === 'upcoming' 
                  ? 'Próximo' 
                  : 'Completado'
              }
            </Badge>
          </CardHeader>
          <CardContent className="pt-0 pb-3 px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Cliente</p>
                <p className="font-medium truncate">{rental.customer.name}</p>
                <p className="text-sm text-muted-foreground truncate">{rental.customer.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Período</p>
                <p className="font-medium text-sm">{new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}</p>
                <p className="text-sm text-muted-foreground">
                  {Math.ceil((new Date(rental.endDate).getTime() - new Date(rental.startDate).getTime()) / (1000 * 60 * 60 * 24))} días
                </p>
              </div>
            </div>
            
            <div className="mt-3 flex justify-between items-center">
              <p className="font-medium">${rental.totalAmount.toFixed(2)}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onViewDetails(rental.id)}
                className="text-xs"
              >
                Ver detalles
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RentalsList;
