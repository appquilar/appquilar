
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, User } from 'lucide-react';
import { Rental } from '@/domain/models/Rental';

interface CustomerInfoCardProps {
  rental: Rental;
}

const CustomerInfoCard = ({ rental }: CustomerInfoCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Información del Cliente</h3>
        <ul className="space-y-4">
          <li className="flex items-start">
            <User className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Cliente</p>
              <p className="text-sm text-muted-foreground">{rental.customer.name}</p>
              <p className="text-xs text-muted-foreground">ID: {rental.customer.id}</p>
            </div>
          </li>
          <li className="flex items-start">
            <Mail className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground break-all">{rental.customer.email}</p>
            </div>
          </li>
          <li className="flex items-start">
            <Phone className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Teléfono</p>
              <p className="text-sm text-muted-foreground">{rental.customer.phone}</p>
            </div>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default CustomerInfoCard;
