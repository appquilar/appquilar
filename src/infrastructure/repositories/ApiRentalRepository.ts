
import { Rental } from '@/domain/models/Rental';
import { IRentalRepository } from '@/domain/repositories/IRentalRepository';

/**
 * API implementation of the IRentalRepository interface
 */
export class ApiRentalRepository implements IRentalRepository {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/rentals') {
    this.baseUrl = baseUrl;
  }

  private async fetchWithErrorHandling<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      console.error('API fetch error:', error);
      throw error;
    }
  }

  async getAllRentals(): Promise<Rental[]> {
    return this.fetchWithErrorHandling<Rental[]>(this.baseUrl);
  }

  async getRentalById(id: string): Promise<Rental | null> {
    try {
      return await this.fetchWithErrorHandling<Rental>(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Error fetching rental with ID ${id}:`, error);
      return null;
    }
  }

  async getRentalsByUserId(userId: string): Promise<Rental[]> {
    return this.fetchWithErrorHandling<Rental[]>(`${this.baseUrl}?userId=${userId}`);
  }

  async getRentalsByProductId(productId: string): Promise<Rental[]> {
    return this.fetchWithErrorHandling<Rental[]>(`${this.baseUrl}?productId=${productId}`);
  }

  async getRentalsByDateRange(startDate: Date, endDate: Date): Promise<Rental[]> {
    const startParam = startDate.toISOString();
    const endParam = endDate.toISOString();
    return this.fetchWithErrorHandling<Rental[]>(
      `${this.baseUrl}?startDate=${startParam}&endDate=${endParam}`
    );
  }

  async getRentalsByStatus(status: string): Promise<Rental[]> {
    return this.fetchWithErrorHandling<Rental[]>(`${this.baseUrl}?status=${status}`);
  }
  
  async createRental(rentalData: Partial<Rental>): Promise<Rental> {
    return this.fetchWithErrorHandling<Rental>(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rentalData),
    });
  }
  
  async updateRental(id: string, rentalData: Partial<Rental>): Promise<Rental> {
    return this.fetchWithErrorHandling<Rental>(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rentalData),
    });
  }
  
  async deleteRental(id: string): Promise<boolean> {
    await this.fetchWithErrorHandling<void>(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
    return true;
  }
}
