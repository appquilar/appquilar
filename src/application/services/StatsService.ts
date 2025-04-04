
import { CompanyStats, StatsRepository, StatsRepositoryFactory } from '@/domain/repositories/StatsRepository';
import { MockStatsRepositoryFactory } from '@/infrastructure/repositories/MockStatsRepository';

/**
 * Service for accessing company statistics
 */
export class StatsService {
  private static instance: StatsService;
  private repository: StatsRepository;
  private static repositoryFactory: StatsRepositoryFactory = new MockStatsRepositoryFactory();

  private constructor(repository: StatsRepository) {
    this.repository = repository;
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): StatsService {
    if (!StatsService.instance) {
      const repository = this.repositoryFactory.createRepository();
      StatsService.instance = new StatsService(repository);
    }
    return StatsService.instance;
  }

  /**
   * Set a custom repository factory implementation
   */
  public static setRepositoryFactory(factory: StatsRepositoryFactory): void {
    this.repositoryFactory = factory;
    if (StatsService.instance) {
      StatsService.instance.repository = factory.createRepository();
    }
  }

  /**
   * Get all stats for a company
   */
  async getCompanyStats(companyId: string): Promise<CompanyStats> {
    return this.repository.getCompanyStats(companyId);
  }
  
  /**
   * Get stats for a specific time period
   */
  async getStatsByPeriod(companyId: string, startDate: Date, endDate: Date): Promise<CompanyStats> {
    return this.repository.getStatsByPeriod(companyId, startDate, endDate);
  }
}
