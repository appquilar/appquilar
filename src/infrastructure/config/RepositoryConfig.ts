
import { ApiRentalRepository } from '../repositories/ApiRentalRepository';
import { MockRentalRepository } from '../repositories/MockRentalRepository';
import { ApiConversationRepository } from '../repositories/ApiConversationRepository';
import { MockConversationRepository } from '../repositories/MockConversationRepository'; 
import { RepositoryFactory } from '../repositories/RepositoryFactory';

/**
 * Repository Configuration
 * 
 * Use this file to configure which repository implementations to use
 */
export class RepositoryConfig {
  /**
   * Initialize repositories for the application
   * @param useApi If true, use API repositories; otherwise, use mock repositories
   * @param apiBaseUrl Base URL for API endpoints
   */
  static initialize(useApi: boolean = false, apiBaseUrl: string = '/api'): void {
    if (useApi) {
      console.info('Initializing API repositories');
      // Set API repositories
      RepositoryFactory.setRentalRepository(new ApiRentalRepository(`${apiBaseUrl}/rentals`));
      RepositoryFactory.setConversationRepository(new ApiConversationRepository(apiBaseUrl));
      // Add more API repositories here as needed
    } else {
      console.info('Initializing mock repositories');
      // Set mock repositories
      RepositoryFactory.setRentalRepository(new MockRentalRepository());
      RepositoryFactory.setConversationRepository(new MockConversationRepository());
      // Repository factory already defaults to mock repositories, but we're explicit here
    }
  }

  /**
   * Switch to API repositories
   * @param apiBaseUrl Base URL for API endpoints
   */
  static useApiRepositories(apiBaseUrl: string = '/api'): void {
    this.initialize(true, apiBaseUrl);
  }

  /**
   * Switch to mock repositories
   */
  static useMockRepositories(): void {
    this.initialize(false);
  }
}
