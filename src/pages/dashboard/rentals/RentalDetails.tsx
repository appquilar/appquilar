
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RentalService } from '@/application/services/RentalService';
import { Rental } from '@/domain/models/Rental';
import { toast } from '@/components/ui/use-toast';
import {
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone,
  Tag,
  User,
  AlertTriangle,
  Check,
  ChevronLeft,
  Edit
} from 'lucide-react';

const RentalDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rental, setRental] = useState<Rental | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMarkingAsReturned, setIsMarkingAsReturned] = useState(false);
  const rentalService = RentalService.getInstance();

  useEffect(() => {
    const loadRental = async () => {
      if (!id) {
        setError('ID de alquiler no proporcionado');
        setIsLoading(false);
        return;
      }

      try {
        const rentalData = await rentalService.getRentalById(id);
        if (rentalData) {
          setRental(rentalData);
        } else {
          setError('No se encontró el alquiler');
        }
      } catch (err) {
        console.error('Error loading rental:', err);
        setError('Error al cargar la información del alquiler');
      } finally {
        setIsLoading(false);
      }
    };

    loadRental();
  }, [id]);

  const handleMarkAsReturned = async () => {
    if (!rental) return;
    
    setIsMarkingAsReturned(true);
    try {
      const updatedRental = await rentalService.updateRental(rental.id, { 
        ...rental, 
        returned: true,
        status: 'completed' as const
      });
      
      setRental(updatedRental);
      toast({
        title: "Estado actualizado",
        description: "El alquiler ha sido marcado como devuelto",
      });
    } catch (err) {
      console.error('Error updating rental:', err);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del alquiler",
        variant: "destructive"
      });
    } finally {
      setIsMarkingAsReturned(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !rental) {
    return (
      <div className="p-4 rounded-md bg-destructive/10 text-destructive">
        <AlertTriangle className="w-6 h-6 mb-2" />
        <h2 className="text-lg font-medium">Error</h2>
        <p>{error || 'No se pudo cargar la información del alquiler'}</p>
        <Button 
          variant="outline" 
          className="mt-4" 
          onClick={() => navigate('/dashboard/rentals')}
        >
          Volver a la lista
        </Button>
      </div>
    );
  }

  // Calculate rental duration in days
  const startDate = new Date(rental.startDate);
  const endDate = new Date(rental.endDate);
  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Format dates to readable strings
  const formattedStartDate = startDate.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const formattedEndDate = endDate.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="container mx-auto py-6">
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
          <Button 
            variant="outline" 
            onClick={() => navigate(`/dashboard/rentals/edit/${rental.id}`)}
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          
          {rental.status === 'active' && !rental.returned && (
            <Button 
              onClick={handleMarkAsReturned}
              disabled={isMarkingAsReturned}
              className="flex items-center gap-1"
            >
              <Check className="h-4 w-4 mr-1" />
              {isMarkingAsReturned ? "Procesando..." : "Marcar como devuelto"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main info card */}
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
                      <p className="text-sm text-muted-foreground">${rental.totalAmount.toFixed(2)}</p>
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
        
        {/* Customer info card */}
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
      </div>
    </div>
  );
};

export default RentalDetails;
