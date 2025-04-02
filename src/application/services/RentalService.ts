
import { Rental } from '@/domain/models/Rental';
import { RentalRepository } from '@/domain/repositories/RentalRepository';
import { MockRentalRepository } from '@/infrastructure/repositories/MockRentalRepository';

/**
 * Service for managing rental data
 */
export class RentalService {
  private static instance: RentalService;
  private repository: RentalRepository;

  private constructor(repository: RentalRepository) {
    this.repository = repository;
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): RentalService {
    if (!RentalService.instance) {
      // Using the mock repository for now
      const repository = new MockRentalRepository();
      RentalService.instance = new RentalService(repository);
    }
    return RentalService.instance;
  }

  /**
   * Set a custom repository implementation
   */
  public static setRepository(repository: RentalRepository): void {
    if (RentalService.instance) {
      RentalService.instance.repository = repository;
    } else {
      RentalService.instance = new RentalService(repository);
    }
  }

  /**
   * Get all rentals
   */
  async getAllRentals(): Promise<Rental[]> {
    return this.repository.getAllRentals();
  }

  /**
   * Get a rental by ID
   */
  async getRentalById(id: string): Promise<Rental | null> {
    return this.repository.getRentalById(id);
  }

  /**
   * Get rentals by user ID
   */
  async getRentalsByUserId(userId: string): Promise<Rental[]> {
    return this.repository.getRentalsByUserId(userId);
  }

  /**
   * Get rentals by product ID
   */
  async getRentalsByProductId(productId: string): Promise<Rental[]> {
    return this.repository.getRentalsByProductId(productId);
  }

  /**
   * Get rentals by date range
   */
  async getRentalsByDateRange(startDate: Date, endDate: Date): Promise<Rental[]> {
    return this.repository.getRentalsByDateRange(startDate, endDate);
  }

  /**
   * Get rentals by status
   */
  async getRentalsByStatus(status: string): Promise<Rental[]> {
    return this.repository.getRentalsByStatus(status);
  }
  
  /**
   * Create a new rental
   */
  async createRental(rentalData: Partial<Rental>): Promise<Rental> {
    return this.repository.createRental(rentalData);
  }
  
  /**
   * Update a rental
   */
  async updateRental(id: string, rentalData: Partial<Rental>): Promise<Rental> {
    return this.repository.updateRental(id, rentalData);
  }
  
  /**
   * Delete a rental
   */
  async deleteRental(id: string): Promise<boolean> {
    return this.repository.deleteRental(id);
  }
}
