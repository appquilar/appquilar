
import { useAuth } from '@/context/AuthContext';
import StatsOverview from './stats/StatsOverview';
import MonthlyStatsChart from './stats/MonthlyStatsChart';
import { MOCK_STATS, chartConfig } from './stats/statsData';

const CompanyStats = () => {
  const { user } = useAuth();
  
  if (!user || (user.role !== 'company_admin' && user.role !== 'company_user')) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold">Panel</h1>
      </div>
      
      {/* Stats overview */}
      <StatsOverview />
      
      {/* Monthly Charts - Each chart takes full width */}
      <div className="space-y-6">
        {/* Views Chart - Full Width */}
        <MonthlyStatsChart 
          title="Product Views - Last Month"
          description="Daily views trend for your products"
          data={MOCK_STATS.monthlyViews}
          dataKey="views"
          chartColor="var(--color-views)"
          label="Views"
          config={chartConfig}
        />
        
        {/* Rentals Chart - Full Width */}
        <MonthlyStatsChart 
          title="Rentals - Last Month"
          description="Daily rental transactions"
          data={MOCK_STATS.monthlyRentals}
          dataKey="rentals"
          chartColor="var(--color-rentals)"
          label="Rentals"
          config={chartConfig}
        />
      </div>
    </div>
  );
};

export default CompanyStats;
