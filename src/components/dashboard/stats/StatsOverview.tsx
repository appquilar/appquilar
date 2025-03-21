
import { Eye, Package, Truck } from 'lucide-react';
import StatsCard from './StatsCard';
import { MOCK_STATS } from './statsData';

const StatsOverview = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Total Rentals"
        value={MOCK_STATS.totalRentals}
        icon={Truck}
        trend={{
          value: "+12%",
          positive: true,
          label: "from last month"
        }}
      />
      
      <StatsCard
        title="Active Rentals"
        value={MOCK_STATS.activeRentals}
        icon={Truck}
        trend={{
          value: "+4%",
          positive: true,
          label: "from last week"
        }}
      />
      
      <StatsCard
        title="Total Products"
        value={MOCK_STATS.totalProducts}
        icon={Package}
        description="In your inventory"
      />
      
      <StatsCard
        title="Product Views"
        value={MOCK_STATS.productViews}
        icon={Eye}
        trend={{
          value: "-3%",
          positive: false,
          label: "from last week"
        }}
      />
    </div>
  );
};

export default StatsOverview;
