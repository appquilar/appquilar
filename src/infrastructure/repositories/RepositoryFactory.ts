
import { IRentalRepository } from '@/domain/repositories/IRentalRepository';
import { IProductRepository } from '@/domain/repositories/IProductRepository';
import { IConversationRepository } from '@/domain/repositories/IConversationRepository';

import { MockRentalRepository } from './MockRentalRepository';
import { MockProductRepository } from './MockProductRepository';
import { MockConversationRepository } from './MockConversationRepository';

/**
 * Factory for creating repositories with proper dependency injection
 */
export class RepositoryFactory {
  private static rentalRepository: IRentalRepository;
  private static productRepository: IProductRepository;
  private static conversationRepository: IConversationRepository;

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

  /**
   * Get the conversation repository instance
   */
  public static getConversationRepository(): IConversationRepository {
    if (!this.conversationRepository) {
      // Default to mock implementation
      this.conversationRepository = new MockConversationRepository();
    }
    return this.conversationRepository;
  }

  /**
   * Set a custom conversation repository implementation
   */
  public static setConversationRepository(repository: IConversationRepository): void {
    this.conversationRepository = repository;
  }
}
