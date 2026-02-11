import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Rental } from '@/domain/models/Rental';
import { RentalStatusService } from '@/domain/services/RentalStatusService';
import { Truck } from 'lucide-react';

interface RentalsListProps {
  rentals: Rental[];
}

const formatMoneyFromCents = (amount: number, currency: string): string => {
  const value = amount / 100;
  return `${value.toFixed(2)} ${currency}`;
};

const RentalContent = ({ rentals }: RentalsListProps) => {
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
              <CardTitle className="text-base font-medium">{rental.productName || 'Producto sin nombre'}</CardTitle>
              {rental.productInternalId && (
                <p className="text-sm text-muted-foreground">Ref. {rental.productInternalId}</p>
              )}
            </div>
            <Badge className={RentalStatusService.getStatusBadgeClasses(rental.status)}>
              {RentalStatusService.getStatusLabel(rental.status)}
            </Badge>
          </CardHeader>
          <CardContent className="pt-0 pb-5 px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Arrendatario</p>
                <p className="font-medium break-all">{rental.renterName ?? 'Sin asignar'}</p>
                <p className="text-sm text-muted-foreground">Propietario: {rental.ownerName ?? 'Sin propietario'}</p>
                {rental.ownerLocation?.label && (
                  <p className="text-sm text-muted-foreground">Tienda: {rental.ownerLocation.label}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Período de alquiler</p>
                <p className="font-medium">
                  {rental.startDate.toLocaleDateString()} a {rental.endDate.toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {Math.ceil((rental.endDate.getTime() - rental.startDate.getTime()) / (1000 * 60 * 60 * 24))} días
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Importe</p>
                <p className="font-medium">
                  {formatMoneyFromCents(rental.price.amount, rental.price.currency)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Fianza: {formatMoneyFromCents(rental.deposit.amount, rental.deposit.currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RentalContent;
