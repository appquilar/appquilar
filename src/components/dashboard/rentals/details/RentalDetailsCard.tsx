
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, Check, Clock, Tag } from 'lucide-react';
import { Rental } from '@/domain/models/Rental';
import { RentalStatusService } from '@/domain/services/RentalStatusService';

interface RentalDetailsCardProps {
  rental: Rental;
  durationDays: number;
  formattedStartDate: string;
  formattedEndDate: string;
}

const RentalDetailsCard = ({
  rental,
  durationDays,
  formattedStartDate,
  formattedEndDate
}: RentalDetailsCardProps) => {
  return (
    <Card className="col-span-1 md:col-span-2">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold">{rental.product}</h2>
            <p className="text-muted-foreground">
              <span className="inline-flex items-center mr-2">
                <Tag className="h-4 w-4 mr-1" />
                Alquiler #{rental.id}
              </span>
            </p>
          </div>
          
          <Badge
            className={`mt-2 md:mt-0 inline-flex items-center ${
              RentalStatusService.getStatusBadgeClasses(rental.status)
            }`}
          >
            {RentalStatusService.getStatusLabel(rental.status)}
          </Badge>
        </div>
        
        <Separator className="my-4" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Detalles del Alquiler</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Calendar className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Período de alquiler</p>
                  <p className="text-sm text-muted-foreground">
                    {formattedStartDate} - {formattedEndDate}
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <Clock className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Duración</p>
                  <p className="text-sm text-muted-foreground">{durationDays} días</p>
                </div>
              </li>
              <li className="flex items-start">
                <Tag className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Importe total</p>
                  <p className="text-sm text-muted-foreground">{rental.totalAmount.toFixed(2)}€</p>
                </div>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Estado</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <Check className={`h-4 w-4 mt-0.5 mr-2 ${rental.returned ? 'text-green-500' : 'text-muted-foreground'}`} />
                <div>
                  <p className="text-sm font-medium">Estado de devolución</p>
                  <p className={`text-sm ${rental.returned ? 'text-green-600' : 'text-amber-600'}`}>
                    {rental.returned ? 'Devuelto' : 'No devuelto'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RentalDetailsCard;
