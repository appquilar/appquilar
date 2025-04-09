
import { useState, useEffect } from 'react';
import { Rental } from '@/domain/models/Rental';
import { RentalService } from '@/application/services/RentalService';
import { RentalStatusService } from '@/domain/services/RentalStatusService';
import { toast } from '@/components/ui/use-toast';

interface UseRentalDetailsReturn {
  rental: Rental | null;
  isLoading: boolean;
  error: string | null;
  isUpdatingStatus: boolean;
  handleStatusChange: (newStatus: 'active' | 'upcoming' | 'completed') => Promise<void>;
  calculateDurationDays: () => number;
  formatDate: (dateString: string) => string;
}

export const useRentalDetails = (id: string | undefined): UseRentalDetailsReturn => {
  const [rental, setRental] = useState<Rental | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
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

  const handleStatusChange = async (newStatus: 'active' | 'upcoming' | 'completed') => {
    if (!rental) return;
    
    setIsUpdatingStatus(true);
    try {
      const updatedRentalData = RentalStatusService.updateRentalStatus(rental, newStatus);
      const updatedRental = await rentalService.updateRental(rental.id, updatedRentalData);
      
      setRental(updatedRental);
      toast({
        title: "Estado actualizado",
        description: `El alquiler ha sido marcado como ${RentalStatusService.getStatusLabel(newStatus)}`,
      });
    } catch (err) {
      console.error('Error updating rental:', err);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del alquiler",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const calculateDurationDays = (): number => {
    if (!rental) return 0;
    
    const startDate = new Date(rental.startDate);
    const endDate = new Date(rental.endDate);
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return {
    rental,
    isLoading,
    error,
    isUpdatingStatus,
    handleStatusChange,
    calculateDurationDays,
    formatDate
  };
};
