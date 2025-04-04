
import { CompanyStats, StatsRepository, DataPoint, StatsRepositoryFactory } from '@/domain/repositories/StatsRepository';
import { MOCK_STATS } from '@/components/dashboard/stats/statsData';

/**
 * Mock implementation of the StatsRepository interface
 */
export class MockStatsRepository implements StatsRepository {
  async getCompanyStats(companyId: string): Promise<CompanyStats> {
    // For now, we return the same mock data regardless of company ID
    return Promise.resolve({
      totalViews: 3458,
      totalRentals: MOCK_STATS.totalRentals,
      totalRevenue: 12500,
      averageRating: 4.2,
      monthlyViews: MOCK_STATS.monthlyViews as DataPoint[],
      monthlyRentals: MOCK_STATS.monthlyRentals as DataPoint[],
      popularProducts: MOCK_STATS.popularProducts,
      recentRentals: MOCK_STATS.recentRentals,
      // Dashboard metrics
      activeRentals: MOCK_STATS.activeRentals,
      totalProducts: MOCK_STATS.totalProducts,
      productViews: MOCK_STATS.productViews,
      // Trend changes (mock values)
      weeklyViewsChange: -3,
      weeklyRentalsChange: 12
    });
  }
  
  async getStatsByPeriod(companyId: string, startDate: Date, endDate: Date): Promise<CompanyStats> {
    // Filter the mock data to only include entries within the date range
    const start = startDate.getTime();
    const end = endDate.getTime();
    
    const filteredViews = MOCK_STATS.monthlyViews.filter(entry => {
      const entryDate = new Date(`2023-07-${entry.day}`).getTime();
      return entryDate >= start && entryDate <= end;
    });
    
    const filteredRentals = MOCK_STATS.monthlyRentals.filter(entry => {
      const entryDate = new Date(`2023-07-${entry.day}`).getTime();
      return entryDate >= start && entryDate <= end;
    });
    
    return Promise.resolve({
      totalViews: 3458,
      totalRentals: MOCK_STATS.totalRentals,
      totalRevenue: 12500,
      averageRating: 4.2,
      monthlyViews: filteredViews as DataPoint[],
      monthlyRentals: filteredRentals as DataPoint[],
      popularProducts: MOCK_STATS.popularProducts,
      recentRentals: MOCK_STATS.recentRentals,
      // Dashboard metrics
      activeRentals: MOCK_STATS.activeRentals,
      totalProducts: MOCK_STATS.totalProducts,
      productViews: MOCK_STATS.productViews,
      // Trend changes (mock values)
      weeklyViewsChange: -3,
      weeklyRentalsChange: 12
    });
  }
}

/**
 * Factory for creating MockStatsRepository instances
 */
export class MockStatsRepositoryFactory implements StatsRepositoryFactory {
  createRepository(): StatsRepository {
    return new MockStatsRepository();
  }
}
