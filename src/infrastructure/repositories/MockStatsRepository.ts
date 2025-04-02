
import { CompanyStats, StatsRepository } from '@/domain/repositories/StatsRepository';
import { MOCK_STATS } from '@/components/dashboard/stats/statsData';

/**
 * Mock implementation of the StatsRepository interface
 */
export class MockStatsRepository implements StatsRepository {
  async getCompanyStats(companyId: string): Promise<CompanyStats> {
    // For now, we return the same mock data regardless of company ID
    return Promise.resolve({
      totalViews: MOCK_STATS.totalViews,
      totalRentals: MOCK_STATS.totalRentals,
      totalRevenue: MOCK_STATS.totalRevenue,
      averageRating: MOCK_STATS.averageRating,
      monthlyViews: MOCK_STATS.monthlyViews,
      monthlyRentals: MOCK_STATS.monthlyRentals,
      popularProducts: MOCK_STATS.popularProducts,
      recentRentals: MOCK_STATS.recentRentals
    });
  }
  
  async getStatsByPeriod(companyId: string, startDate: Date, endDate: Date): Promise<CompanyStats> {
    // Filter the mock data to only include entries within the date range
    const start = startDate.getTime();
    const end = endDate.getTime();
    
    const filteredViews = MOCK_STATS.monthlyViews.filter(entry => {
      const entryDate = new Date(entry.date).getTime();
      return entryDate >= start && entryDate <= end;
    });
    
    const filteredRentals = MOCK_STATS.monthlyRentals.filter(entry => {
      const entryDate = new Date(entry.date).getTime();
      return entryDate >= start && entryDate <= end;
    });
    
    return Promise.resolve({
      ...MOCK_STATS,
      monthlyViews: filteredViews,
      monthlyRentals: filteredRentals
    });
  }
}
