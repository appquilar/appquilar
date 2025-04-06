
import { Eye, Package, Truck } from 'lucide-react';
import StatsCard from './StatsCard';
import { MOCK_STATS } from '@/infrastructure/repositories/mock-data/statsMockData';

const StatsOverview = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Total Alquileres"
        value={MOCK_STATS.totalRentals}
        icon={Truck}
        trend={{
          value: "+12%",
          positive: true,
          label: "respecto al mes pasado"
        }}
      />
      
      <StatsCard
        title="Alquileres Activos"
        value={MOCK_STATS.activeRentals}
        icon={Truck}
        trend={{
          value: "-4%",
          positive: false,
          label: "respecto a la semana pasada"
        }}
      />
      
      <StatsCard
        title="Total Productos"
        value={MOCK_STATS.totalProducts}
        icon={Package}
        description="3 agregados esta semana"
        descriptionColor="positive"
      />
      
      <StatsCard
        title="Vistas de Productos"
        value={MOCK_STATS.productViews}
        icon={Eye}
        description="5 menos que ayer"
        descriptionColor="negative"
      />
    </div>
  );
};

export default StatsOverview;
