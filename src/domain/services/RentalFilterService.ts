
import { Rental } from '../models/Rental';
import { RentalFilters, RentalCounts } from '../models/RentalFilters';

/**
 * Servicio de dominio para filtrado de alquileres
 */
export class RentalFilterService {
  private static readonly CANCELLED_STATUSES = new Set([
    'cancelled',
    'rejected',
    'expired',
  ]);

  private static readonly COMPLETED_STATUSES = new Set([
    'rental_completed',
  ]);

  private static isPendingStatus(status: string): boolean {
    return !this.CANCELLED_STATUSES.has(status) && !this.COMPLETED_STATUSES.has(status);
  }

  private static matchesStatusFilter(rental: Rental, statusFilter: RentalFilters['statusFilter']): boolean {
    if (statusFilter === 'cancelled') {
      return this.CANCELLED_STATUSES.has(rental.status);
    }

    if (statusFilter === 'completed') {
      return this.COMPLETED_STATUSES.has(rental.status);
    }

    return this.isPendingStatus(rental.status);
  }

  /**
   * Filtra alquileres basados en criterios de búsqueda
   */
  static filterRentals(
    rentals: Rental[],
    filters: RentalFilters
  ): Rental[] {
    const { searchQuery, rentalId, startDate, endDate, statusFilter } = filters;
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filtered = rentals.filter(rental => {
      // Filter by search query (IDs)
      const nameMatch = searchQuery 
        ? (rental.productName ?? '').toLowerCase().includes(normalizedQuery) ||
          (rental.renterName ?? '').toLowerCase().includes(normalizedQuery) ||
          (rental.ownerName ?? '').toLowerCase().includes(normalizedQuery) ||
          (rental.ownerLocation?.label ?? '').toLowerCase().includes(normalizedQuery)
        : true;
      
      // Filter by rental ID
      const idMatch = rentalId 
        ? rental.id.includes(rentalId)
        : true;
      
      // Filter by date range
      const rentalStartDate = rental.startDate;
      const rentalEndDate = rental.endDate;
      
      const dateMatch = (startDate && endDate)
        ? (rentalStartDate >= startDate && rentalStartDate <= endDate) ||
          (rentalEndDate >= startDate && rentalEndDate <= endDate) ||
          (rentalStartDate <= startDate && rentalEndDate >= endDate)
        : startDate
          ? rentalStartDate >= startDate || rentalEndDate >= startDate
          : endDate
            ? rentalStartDate <= endDate || rentalEndDate <= endDate
            : true;
      
      const statusMatch = this.matchesStatusFilter(rental, statusFilter);

      return nameMatch && idMatch && dateMatch && statusMatch;
    });

    return [...filtered].sort(
      (left, right) => left.startDate.getTime() - right.startDate.getTime()
    );
  }

  /**
   * Calcula conteos por estado de los alquileres
   */
  static calculateRentalCounts(rentals: Rental[]): RentalCounts {
    const now = new Date();

    return {
      leads: rentals.filter((rental) => rental.isLead).length,
      upcoming: rentals.filter((rental) => !rental.isLead && rental.endDate >= now).length,
      past: rentals.filter((rental) => !rental.isLead && rental.endDate < now).length,
    };
  }
  
  /**
   * Verifica si hay alquileres en una fecha específica
   */
  static hasRentalsOnDate(rentals: Rental[], date: Date): boolean {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return rentals.some(rental => {
      const startDate = new Date(rental.startDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(rental.endDate);
      endDate.setHours(0, 0, 0, 0);
      
      return (targetDate >= startDate && targetDate <= endDate);
    });
  }
}
