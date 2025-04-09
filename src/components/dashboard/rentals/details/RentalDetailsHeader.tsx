
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Rental } from '@/domain/models/Rental';
import { RentalStatusService } from '@/domain/services/RentalStatusService';

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

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate('/dashboard/rentals')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-semibold">
            Detalles del Alquiler
          </h1>
          <p className="text-muted-foreground">
            ID: {rental.id}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Select 
          value={rental.status} 
          disabled={isUpdatingStatus}
          onValueChange={(value) => onStatusChange(value as 'active' | 'upcoming' | 'completed')}
        >
          <SelectTrigger className="w-[180px]">
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
