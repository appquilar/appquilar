import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, MessageCircle } from 'lucide-react';
import { Rental } from '@/domain/models/Rental';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { RentalStatusService } from '@/domain/services/RentalStatusService';

interface RentalDetailsHeaderProps {
  rental: Rental;
}

const RentalDetailsHeader = ({ rental }: RentalDetailsHeaderProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className={`flex flex-col ${isMobile ? 'space-y-3 mb-3' : 'items-center justify-between mb-6'} md:flex-row`}>
      <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/dashboard/rentals')}
          className="h-8 w-8 flex-shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-display font-semibold line-clamp-1`}>
            Detalles del Alquiler
          </h1>
          <p className="text-muted-foreground text-sm">{rental.productName || 'Producto sin nombre'}</p>
        </div>
      </div>

      <div className={`${isMobile ? 'w-full' : ''} mt-2 md:mt-0 flex flex-col md:flex-row gap-2 md:items-center md:justify-end`}>
        <Button
          type="button"
          variant="outline"
          className={isMobile ? 'w-full' : ''}
          onClick={() => navigate(`/dashboard/messages?rent_id=${rental.id}`)}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Ver mensajes
        </Button>
        <Badge className={`inline-flex items-center ${RentalStatusService.getStatusBadgeClasses(rental.status)}`}>
          {RentalStatusService.getStatusLabel(rental.status)}
        </Badge>
      </div>
    </div>
  );
};

export default RentalDetailsHeader;
