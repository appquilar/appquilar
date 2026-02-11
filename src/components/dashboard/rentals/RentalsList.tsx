import React from 'react';
import { Truck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Rental } from '@/domain/models/Rental';
import { RentalStatusService } from '@/domain/services/RentalStatusService';

interface RentalsListProps {
  rentals: Rental[];
  onViewDetails: (rentalId: string) => void;
  roleTab: 'owner' | 'renter';
}

const formatMoneyFromCents = (amount: number, currency: string): string => {
  const value = amount / 100;
  return `${value.toFixed(2)} ${currency}`;
};

const RentalsList = ({ rentals, onViewDetails, roleTab }: RentalsListProps) => {
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
              <CardTitle className="text-base font-medium">{rental.productName || 'Producto sin nombre'}</CardTitle>
              {rental.productInternalId && (
                <p className="text-sm text-muted-foreground">Ref. {rental.productInternalId}</p>
              )}
            </div>
            <Badge className={RentalStatusService.getStatusBadgeClasses(rental.status)}>
              {RentalStatusService.getStatusLabel(rental.status)}
            </Badge>
          </CardHeader>
          <CardContent className="pt-0 pb-3 px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-muted-foreground">
                  {roleTab === 'owner' ? 'Arrendatario' : 'Propietario'}
                </p>
                <p className="font-medium truncate">
                  {roleTab === 'owner'
                    ? (rental.renterName ?? 'Sin asignar')
                    : (rental.ownerName ?? 'Sin propietario')}
                </p>
                {roleTab === 'renter' && rental.ownerLocation?.label && (
                  <p className="text-sm text-muted-foreground truncate">Tienda: {rental.ownerLocation.label}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Período</p>
                <p className="font-medium text-sm">
                  {rental.startDate.toLocaleDateString()} - {rental.endDate.toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {Math.ceil((rental.endDate.getTime() - rental.startDate.getTime()) / (1000 * 60 * 60 * 24))} días
                </p>
              </div>
            </div>

            <div className="mt-3 flex justify-between items-center">
              <div>
                <p className="text-xs text-muted-foreground">Precio</p>
                <p className="font-medium">
                  {formatMoneyFromCents(rental.price.amount, rental.price.currency)}
                </p>
              </div>
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
