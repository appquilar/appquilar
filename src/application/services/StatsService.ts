
import { CompanyStats, StatsRepository } from '@/domain/repositories/StatsRepository';
import { MockStatsRepository } from '@/infrastructure/repositories/MockStatsRepository';

/**
 * Service for accessing company statistics
 */
export class StatsService {
  private static instance: StatsService;
  private repository: StatsRepository;

  private constructor(repository: StatsRepository) {
    this.repository = repository;
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): StatsService {
    if (!StatsService.instance) {
      // Using the mock repository for now
      const repository = new MockStatsRepository();
      StatsService.instance = new StatsService(repository);
    }
    return StatsService.instance;
  }

  /**
   * Set a custom repository implementation
   */
  public static setRepository(repository: StatsRepository): void {
    if (StatsService.instance) {
      StatsService.instance.repository = repository;
    } else {
      StatsService.instance = new StatsService(repository);
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
