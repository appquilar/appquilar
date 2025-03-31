
import React from 'react';
import { Truck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Rental } from '@/domain/models/Rental';

interface RentalsListProps {
  rentals: Rental[];
}

const RentalsList = ({ rentals }: RentalsListProps) => {
  if (rentals.length === 0) {
    return (
      <div className="text-center py-10">
        <Truck size={40} className="mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-1">No se encontraron alquileres</h3>
        <p className="text-muted-foreground">Prueba ajustando tu búsqueda o filtros.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {rentals.map((rental) => (
        <Card key={rental.id} className="hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between py-5">
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
          <CardContent className="pt-0 pb-5 px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Cliente</p>
                <p className="font-medium">{rental.customer.name}</p>
                <p className="text-sm text-muted-foreground">{rental.customer.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Período de alquiler</p>
                <p className="font-medium">{rental.startDate} a {rental.endDate}</p>
                <p className="text-sm text-muted-foreground">
                  {Math.ceil((new Date(rental.endDate).getTime() - new Date(rental.startDate).getTime()) / (1000 * 60 * 60 * 24))} días
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Importe</p>
                <p className="font-medium">${rental.totalAmount.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  {rental.returned ? 'Devuelto' : 'No devuelto'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4 justify-end">
              <Button variant="outline" size="sm">Ver detalles</Button>
              {rental.status === 'active' && (
                <Button size="sm">Marcar como devuelto</Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RentalsList;
