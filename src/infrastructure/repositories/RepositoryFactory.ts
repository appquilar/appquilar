
import { IRentalRepository } from '@/domain/repositories/IRentalRepository';
import { IProductRepository } from '@/domain/repositories/IProductRepository';

import { MockRentalRepository } from './MockRentalRepository';
import { MockProductRepository } from './MockProductRepository';

/**
 * Factory for creating repositories with proper dependency injection
 */
export class RepositoryFactory {
  private static rentalRepository: IRentalRepository;
  private static productRepository: IProductRepository;

  /**
   * Get the rental repository instance
   */
  public static getRentalRepository(): IRentalRepository {
    if (!this.rentalRepository) {
      // Default to mock implementation
      this.rentalRepository = new MockRentalRepository();
    }
    return this.rentalRepository;
  }

  /**
   * Set a custom rental repository implementation
   */
  public static setRentalRepository(repository: IRentalRepository): void {
    this.rentalRepository = repository;
  }

  /**
   * Get the product repository instance
   */
  public static getProductRepository(): IProductRepository {
    if (!this.productRepository) {
      // Default to mock implementation
      this.productRepository = new MockProductRepository();
    }
    return this.productRepository;
  }

  /**
   * Set a custom product repository implementation
   */
  public static setProductRepository(repository: IProductRepository): void {
    this.productRepository = repository;
  }
}
