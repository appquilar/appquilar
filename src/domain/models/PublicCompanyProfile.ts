export interface PublicCompanyLocation {
  city: string | null;
  state: string | null;
  country: string | null;
}

export interface PublicCompanyTrustMetrics {
  activeProductsCount: number;
  totalProductsCount: number;
  completedRentalsCount: number;
  totalRentsCount: number;
  averageFirstResponseMinutes30d: number | null;
  responseRate24h30d: number;
  views30d: number;
  uniqueVisitors30d: number;
  loggedViews30d: number;
  anonymousViews30d: number;
}

export interface PublicCompanyProfile {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  profilePictureId: string | null;
  location: PublicCompanyLocation;
  trustMetrics: PublicCompanyTrustMetrics;
}
