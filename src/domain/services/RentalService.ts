import { Rental } from '../models/Rental';
import { RentalCounts, RentalFilters } from '../models/RentalFilters';
import { RentalFilterService } from './RentalFilterService';

export class RentalService {
  static filterRentals(rentals: Rental[], filters: RentalFilters): Rental[] {
    return RentalFilterService.filterRentals(rentals, filters);
  }

  static calculateRentalCounts(rentals: Rental[]): RentalCounts {
    return RentalFilterService.calculateRentalCounts(rentals);
  }
}
