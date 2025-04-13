
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Rental } from '@/domain/models/Rental';
import { RentalStatusService } from '@/domain/services/RentalStatusService';
import { useIsMobile } from '@/hooks/use-mobile';

interface RentalDetailsHeaderProps {
  rental: Rental;
  isUpdatingStatus: boolean;
  onStatusChange: (value: 'active' | 'upcoming' | 'completed') => void;
}

const RentalDetailsHeader = ({ 
  rental, 
  isUpdatingStatus, 
  onStatusChange 
}: RentalDetailsHeaderProps) => {
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
          <p className="text-muted-foreground text-sm">
            ID: {rental.id}
          </p>
        </div>
      </div>

      <div className={`${isMobile ? 'w-full' : ''} mt-2 md:mt-0`}>
        <Select 
          value={rental.status} 
          disabled={isUpdatingStatus}
          onValueChange={(value) => onStatusChange(value as 'active' | 'upcoming' | 'completed')}
        >
          <SelectTrigger className={`${isMobile ? 'w-full' : 'w-[180px]'}`}>
            <SelectValue placeholder="Cambiar estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="upcoming">Próximo</SelectItem>
            <SelectItem value="completed">Completado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default RentalDetailsHeader;
