
import { Rental } from '../models/Rental';
import { RentalFilters, RentalCounts } from '../models/RentalFilters';

/**
 * Servicio de dominio para filtrado de alquileres
 */
export class RentalFilterService {
  /**
   * Filtra alquileres basados en criterios de búsqueda
   */
  static filterRentals(
    rentals: Rental[],
    filters: RentalFilters
  ): Rental[] {
    const { searchQuery, rentalId, startDate, endDate, activeTab } = filters;
    
    return rentals.filter(rental => {
      // Filter by search query (name or email)
      const nameMatch = searchQuery 
        ? rental.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
          rental.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          rental.customer.email.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      
      // Filter by rental ID
      const idMatch = rentalId 
        ? rental.id.includes(rentalId)
        : true;
      
      // Filter by date range
      const rentalStartDate = new Date(rental.startDate);
      const rentalEndDate = new Date(rental.endDate);
      
      const dateMatch = (startDate && endDate)
        ? (rentalStartDate >= startDate && rentalStartDate <= endDate) ||
          (rentalEndDate >= startDate && rentalEndDate <= endDate) ||
          (rentalStartDate <= startDate && rentalEndDate >= endDate)
        : startDate
          ? rentalStartDate >= startDate || rentalEndDate >= startDate
          : endDate
            ? rentalStartDate <= endDate || rentalEndDate <= endDate
            : true;
      
      // Filter by tab/status
      const statusMatch = activeTab === 'all' 
        ? true 
        : rental.status === activeTab;
      
      return nameMatch && idMatch && dateMatch && statusMatch;
    });
  }

  /**
   * Calcula conteos por estado de los alquileres
   */
  static calculateRentalCounts(rentals: Rental[]): RentalCounts {
    return {
      all: rentals.length,
      active: rentals.filter(r => r.status === 'active').length,
      upcoming: rentals.filter(r => r.status === 'upcoming').length,
      completed: rentals.filter(r => r.status === 'completed').length,
    };
  }
}
