
/**
 * Domain model for statistics data structures
 */

export interface StatsPeriod {
  views: number;
  rentals: number;
  date: string;
}

export interface StatsDataPoint {
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

export interface CompanyDashboardStats {
  totalRentals: number;
  activeRentals: number;
  totalProducts: number;
  productViews: number;
  popularProducts: PopularProduct[];
  recentRentals: RecentRental[];
  monthlyViews: StatsDataPoint[];
  monthlyRentals: StatsDataPoint[];
}
