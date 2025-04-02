
import { Rental } from '../models/Rental';

/**
 * Repository interface for accessing and managing Rental data
 */
export interface RentalRepository {
  /**
   * Get all rentals
   */
  getAllRentals(): Promise<Rental[]>;
  
  /**
   * Get a rental by ID
   */
  getRentalById(id: string): Promise<Rental | null>;
  
  /**
   * Get rentals by user ID
   */
  getRentalsByUserId(userId: string): Promise<Rental[]>;
  
  /**
   * Get rentals by product ID
   */
  getRentalsByProductId(productId: string): Promise<Rental[]>;
  
  /**
   * Get rentals by date range
   */
  getRentalsByDateRange(startDate: Date, endDate: Date): Promise<Rental[]>;
  
  /**
   * Get rentals by status
   */
  getRentalsByStatus(status: string): Promise<Rental[]>;
  
  /**
   * Create a new rental
   */
  createRental(rentalData: Partial<Rental>): Promise<Rental>;
  
  /**
   * Update a rental
   */
  updateRental(id: string, rentalData: Partial<Rental>): Promise<Rental>;
  
  /**
   * Delete a rental
   */
  deleteRental(id: string): Promise<boolean>;
}
