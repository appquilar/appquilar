import { Card, CardContent } from '@/components/ui/card';
import { Building2, User } from 'lucide-react';
import { Rental } from '@/domain/models/Rental';

interface CustomerInfoCardProps {
  rental: Rental;
}

const CustomerInfoCard = ({ rental }: CustomerInfoCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Participantes</h3>
        <ul className="space-y-4">
          <li className="flex items-start">
            <User className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Arrendatario</p>
              <p className="text-sm text-muted-foreground break-all">{rental.renterName ?? 'Sin asignar'}</p>
            </div>
          </li>
          <li className="flex items-start">
            <Building2 className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Propietario</p>
              <p className="text-sm text-muted-foreground break-all">{rental.ownerName ?? 'Sin propietario'}</p>
              {rental.ownerLocation?.label && (
                <p className="text-xs text-muted-foreground">Tienda: {rental.ownerLocation.label}</p>
              )}
            </div>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default CustomerInfoCard;
