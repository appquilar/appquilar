
/**
 * @fileoverview Modelo de dominio para filtros de alquileres
 */

export interface RentalFilters {
  searchQuery: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  rentalId: string;
  activeTab: string;
}

export interface RentalCounts {
  all: number;
  active: number;
  upcoming: number;
  completed: number;
}
