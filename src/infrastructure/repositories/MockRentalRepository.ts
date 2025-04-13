
import { Rental } from '@/domain/models/Rental';
import { IRentalRepository } from '@/domain/repositories/IRentalRepository';
import { MOCK_RENTALS } from '@/infrastructure/adapters/mockData/rentals/mockRentalsData';

/**
 * Mock implementation of the IRentalRepository interface
 */
export class MockRentalRepository implements IRentalRepository {
  private rentals: Rental[] = MOCK_RENTALS;

  async getAllRentals(): Promise<Rental[]> {
    return Promise.resolve([...this.rentals]);
  }

  async getRentalById(id: string): Promise<Rental | null> {
    const rental = this.rentals.find(rental => rental.id === id);
    return Promise.resolve(rental || null);
  }

  async getRentalsByUserId(userId: string): Promise<Rental[]> {
    const filtered = this.rentals.filter(rental => rental.customer.id === userId);
    return Promise.resolve(filtered);
  }

  async getRentalsByProductId(productId: string): Promise<Rental[]> {
    const filtered = this.rentals.filter(rental => rental.product === productId);
    return Promise.resolve(filtered);
  }

  async getRentalsByDateRange(startDate: Date, endDate: Date): Promise<Rental[]> {
    const filtered = this.rentals.filter(rental => {
      const rentalStart = new Date(rental.startDate);
      const rentalEnd = new Date(rental.endDate);
      
      return (
        (rentalStart >= startDate && rentalStart <= endDate) ||
        (rentalEnd >= startDate && rentalEnd <= endDate) ||
        (rentalStart <= startDate && rentalEnd >= endDate)
      );
    });
    
    return Promise.resolve(filtered);
  }

  async getRentalsByStatus(status: string): Promise<Rental[]> {
    const filtered = this.rentals.filter(rental => rental.status === status);
    return Promise.resolve(filtered);
  }
  
  async createRental(rentalData: Partial<Rental>): Promise<Rental> {
    const newRental = {
      id: `${this.rentals.length + 1}`,
      ...rentalData
    } as Rental;
    
    this.rentals.push(newRental);
    return Promise.resolve(newRental);
  }
  
  async updateRental(id: string, rentalData: Partial<Rental>): Promise<Rental> {
    const index = this.rentals.findIndex(rental => rental.id === id);
    if (index === -1) {
      throw new Error(`Rental with id ${id} not found`);
    }
    
    const updatedRental = {
      ...this.rentals[index],
      ...rentalData
    };
    
    this.rentals[index] = updatedRental;
    return Promise.resolve(updatedRental);
  }
  
  async deleteRental(id: string): Promise<boolean> {
    const initialLength = this.rentals.length;
    this.rentals = this.rentals.filter(rental => rental.id !== id);
    return Promise.resolve(this.rentals.length !== initialLength);
  }
}
