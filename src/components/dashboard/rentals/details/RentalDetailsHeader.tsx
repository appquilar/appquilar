import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, MessageCircle } from 'lucide-react';
import { Rental } from '@/domain/models/Rental';

interface RentalDetailsHeaderProps {
  rental: Rental;
}

const RentalDetailsHeader = ({ rental }: RentalDetailsHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="mb-4 flex flex-col gap-4 md:mb-6 md:flex-row md:items-start md:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/dashboard/rentals')}
          className="h-10 w-10 flex-shrink-0 rounded-xl"
          aria-label="Volver al listado de alquileres"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">Deal room</p>
          <h1 className="line-clamp-2 font-display text-2xl font-semibold leading-tight text-foreground md:text-4xl md:leading-tight">
            {rental.productName || 'Producto sin nombre'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona el estado, la conversacion y las acciones del alquiler desde aqui.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row md:justify-end">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => navigate(`/dashboard/messages?rent_id=${rental.id}`)}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Ir al inbox
        </Button>
      </div>
    </div>
  );
};

export default RentalDetailsHeader;
