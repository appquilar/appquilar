
/**
 * Interface for statistic data structures
 */
export interface StatsPeriod {
  views: number;
  rentals: number;
  date: string;
}

export interface DataPoint {
  day: string;
  views?: number;
  rentals?: number;
  [key: string]: any; // Support for additional metrics
}

export interface PopularProduct {
  id: string;
  name: string;
  views: number;
  rentals: number;
}

export interface RecentRental {
  id: string;
  product: string;
  customer: string;
  date: string;
  days: number;
  status: string;
}

export interface CompanyStats {
  totalViews: number;
  totalRentals: number;
  totalRevenue: number;
  averageRating: number;
  monthlyViews: DataPoint[];
  monthlyRentals: DataPoint[];
  popularProducts: PopularProduct[];
  recentRentals: RecentRental[];
  // New additions for dashboard metrics
  activeRentals?: number;
  totalProducts?: number;
  productViews?: number;
  // Weekly changes for trends
  weeklyViewsChange?: number;
  weeklyRentalsChange?: number;
}

/**
 * Repository interface for accessing company statistics
 */
export interface StatsRepository {
  /**
   * Get all stats for a company
   */
  getCompanyStats(companyId: string): Promise<CompanyStats>;
  
  /**
   * Get stats for a specific time period
   */
  getStatsByPeriod(companyId: string, startDate: Date, endDate: Date): Promise<CompanyStats>;
}

/**
 * Factory to create StatsRepository implementations
 */
export interface StatsRepositoryFactory {
  createRepository(): StatsRepository;
}
