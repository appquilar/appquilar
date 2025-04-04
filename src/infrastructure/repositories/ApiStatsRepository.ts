
import { CompanyStats, StatsRepository, DataPoint, StatsRepositoryFactory } from '@/domain/repositories/StatsRepository';
import { MOCK_STATS } from '@/components/dashboard/stats/statsData';

/**
 * API implementation of the StatsRepository interface
 * This will connect to a real backend API
 */
export class ApiStatsRepository implements StatsRepository {
  private apiBaseUrl: string;
  
  constructor(apiBaseUrl: string = '/api') {
    this.apiBaseUrl = apiBaseUrl;
  }
  
  async getCompanyStats(companyId: string): Promise<CompanyStats> {
    try {
      // This would be a real API call in production
      const response = await fetch(`${this.apiBaseUrl}/stats/company/${companyId}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json() as CompanyStats;
    } catch (error) {
      console.error("Error fetching company stats:", error);
      // Fallback to mock data in case of error
      return this.getFallbackData();
    }
  }
  
  async getStatsByPeriod(companyId: string, startDate: Date, endDate: Date): Promise<CompanyStats> {
    try {
      // Format dates for API
      const start = startDate.toISOString().split('T')[0];
      const end = endDate.toISOString().split('T')[0];
      
      // This would be a real API call in production
      const response = await fetch(
        `${this.apiBaseUrl}/stats/company/${companyId}/period?start=${start}&end=${end}`
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json() as CompanyStats;
    } catch (error) {
      console.error("Error fetching period stats:", error);
      // Fallback to mock data in case of error
      return this.getFallbackData();
    }
  }
  
  // Fallback method to return mock data in case of API failure
  private getFallbackData(): CompanyStats {
    return {
      totalViews: 3458,
      totalRentals: MOCK_STATS.totalRentals,
      totalRevenue: 12500,
      averageRating: 4.2,
      monthlyViews: MOCK_STATS.monthlyViews as DataPoint[],
      monthlyRentals: MOCK_STATS.monthlyRentals as DataPoint[],
      popularProducts: MOCK_STATS.popularProducts,
      recentRentals: MOCK_STATS.recentRentals,
      activeRentals: MOCK_STATS.activeRentals,
      totalProducts: MOCK_STATS.totalProducts,
      productViews: MOCK_STATS.productViews,
      weeklyViewsChange: -3,
      weeklyRentalsChange: 12
    };
  }
}

/**
 * Factory for creating ApiStatsRepository instances
 */
export class ApiStatsRepositoryFactory implements StatsRepositoryFactory {
  private apiBaseUrl: string;
  
  constructor(apiBaseUrl: string = '/api') {
    this.apiBaseUrl = apiBaseUrl;
  }
  
  createRepository(): StatsRepository {
    return new ApiStatsRepository(this.apiBaseUrl);
  }
}
