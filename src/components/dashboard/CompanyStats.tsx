
import { useAuth } from '@/context/AuthContext';
import StatsOverview from './stats/StatsOverview';
import MonthlyStatsChart from './stats/MonthlyStatsChart';
import { MOCK_STATS, chartConfig } from './stats/statsData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Truck } from 'lucide-react';

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
      
      {/* Additional Stats Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Popular Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">
              Popular Products
            </CardTitle>
            <Package size={18} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_STATS.popularProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.views} views, {product.rentals} rentals</p>
                  </div>
                  <div className="text-sm font-medium">
                    #{product.id}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Rentals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">
              Recent Rentals
            </CardTitle>
            <Truck size={18} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_STATS.recentRentals.map((rental) => (
                <div key={rental.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{rental.product}</p>
                    <p className="text-xs text-muted-foreground">
                      {rental.customer} • {rental.date} • {rental.days} days
                    </p>
                  </div>
                  <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                    rental.status === 'active' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                      : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                  }`}>
                    {rental.status === 'active' ? 'Active' : 'Completed'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
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
