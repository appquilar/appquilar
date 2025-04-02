
import { useEffect, useState } from 'react';
import { Rental } from '@/domain/models/Rental';
import { RentalService } from '@/application/services/RentalService';

export const useRentals = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const rentalService = RentalService.getInstance();

  useEffect(() => {
    const loadRentals = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const allRentals = await rentalService.getAllRentals();
        setRentals(allRentals);
      } catch (err) {
        console.error('Error loading rentals:', err);
        setError('Error al cargar alquileres');
      } finally {
        setIsLoading(false);
      }
    };

    loadRentals();
  }, []);

  // Function to handle filtering
  const getRentalsByStatus = (status: string | null) => {
    if (!status || status === 'all') {
      return rentals;
    }
    return rentals.filter(rental => rental.status === status);
  };

  return {
    rentals,
    isLoading,
    error,
    getRentalsByStatus
  };
};
