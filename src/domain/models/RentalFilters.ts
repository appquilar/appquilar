export type RentalRoleTab = 'owner' | 'renter';
export type RentalCategoryTab = 'leads' | 'upcoming' | 'past';
export type RentalStatusFilter = 'pending' | 'cancelled' | 'completed';

export interface RentalFilters {
  searchQuery: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  rentalId: string;
  statusFilter: RentalStatusFilter;
  roleTab: RentalRoleTab;
}

export interface RentalCounts {
  leads: number;
  upcoming: number;
  past: number;
}
