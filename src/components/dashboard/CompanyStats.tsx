
import { useAuth } from '@/context/AuthContext';
import StatsOverview from './stats/StatsOverview';
import MonthlyStatsChart from './stats/MonthlyStatsChart';
import { MOCK_STATS, chartConfig } from './stats/statsData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

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
              Productos Populares
            </CardTitle>
            <Package size={18} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_STATS.popularProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.views} vistas, {product.rentals} alquileres</p>
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
              Alquileres Recientes
            </CardTitle>
            <Truck size={18} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_STATS.recentRentals.map((rental) => (
                <Link 
                  key={rental.id} 
                  to={`/dashboard/rentals/${rental.id}`}
                  className="block hover:bg-muted transition-colors rounded-md p-2 -m-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{rental.product}</p>
                      <p className="text-xs text-muted-foreground">
                        {rental.customer} • {rental.date} • {rental.days} días
                      </p>
                    </div>
                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                      rental.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}>
                      {rental.status === 'active' ? 'Activo' : 'Completado'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Monthly Charts - Each chart takes full width */}
      <div className="space-y-6">
        {/* Views Chart - Full Width */}
        <MonthlyStatsChart 
          title="Vistas de Productos"
          description="Tendencia diaria de vistas de tus productos"
          data={MOCK_STATS.monthlyViews}
          dataKey="views"
          chartColor="var(--color-views)"
          label="Vistas"
          config={chartConfig}
        />
        
        {/* Rentals Chart - Full Width */}
        <MonthlyStatsChart 
          title="Alquileres"
          description="Transacciones diarias de alquiler"
          data={MOCK_STATS.monthlyRentals}
          dataKey="rentals"
          chartColor="var(--color-rentals)"
          label="Alquileres"
          config={chartConfig}
        />
      </div>
    </div>
  );
};

export default CompanyStats;
