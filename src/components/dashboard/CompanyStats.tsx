import { ArrowDown, ArrowUp, Eye, Package, Truck, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

// Mock stats data - would come from backend API in production
const MOCK_STATS = {
  totalRentals: 156,
  activeRentals: 24,
  totalProducts: 42,
  productViews: 3458,
  popularProducts: [
    { id: '1', name: 'Hammer Drill 20V', views: 421, rentals: 34 },
    { id: '2', name: 'Table Saw with Stand', views: 386, rentals: 29 },
    { id: '3', name: 'Concrete Bull Float', views: 312, rentals: 18 },
  ],
  recentRentals: [
    { id: '1', product: 'Hammer Drill 20V', customer: 'John Smith', date: '2023-07-15', days: 3, status: 'active' },
    { id: '2', product: 'Table Saw with Stand', customer: 'Sarah Johnson', date: '2023-07-12', days: 7, status: 'active' },
    { id: '3', product: 'Landscaping Tool Set', customer: 'Michael Brown', date: '2023-07-10', days: 2, status: 'completed' },
  ],
  // Mock data for monthly views chart
  monthlyViews: [
    { day: '01', views: 45 },
    { day: '02', views: 52 },
    { day: '03', views: 49 },
    { day: '04', views: 62 },
    { day: '05', views: 74 },
    { day: '06', views: 58 },
    { day: '07', views: 63 },
    { day: '08', views: 71 },
    { day: '09', views: 84 },
    { day: '10', views: 96 },
    { day: '11', views: 88 },
    { day: '12', views: 110 },
    { day: '13', views: 102 },
    { day: '14', views: 119 },
    { day: '15', views: 124 },
    { day: '16', views: 118 },
    { day: '17', views: 132 },
    { day: '18', views: 140 },
    { day: '19', views: 145 },
    { day: '20', views: 151 },
    { day: '21', views: 148 },
    { day: '22', views: 156 },
    { day: '23', views: 165 },
    { day: '24', views: 171 },
    { day: '25', views: 185 },
    { day: '26', views: 195 },
    { day: '27', views: 201 },
    { day: '28', views: 215 },
    { day: '29', views: 218 },
    { day: '30', views: 223 },
  ],
  // Mock data for monthly rentals chart
  monthlyRentals: [
    { day: '01', rentals: 2 },
    { day: '02', rentals: 3 },
    { day: '03', rentals: 1 },
    { day: '04', rentals: 4 },
    { day: '05', rentals: 2 },
    { day: '06', rentals: 5 },
    { day: '07', rentals: 3 },
    { day: '08', rentals: 4 },
    { day: '09', rentals: 6 },
    { day: '10', rentals: 5 },
    { day: '11', rentals: 3 },
    { day: '12', rentals: 7 },
    { day: '13', rentals: 5 },
    { day: '14', rentals: 6 },
    { day: '15', rentals: 8 },
    { day: '16', rentals: 7 },
    { day: '17', rentals: 9 },
    { day: '18', rentals: 8 },
    { day: '19', rentals: 10 },
    { day: '20', rentals: 8 },
    { day: '21', rentals: 7 },
    { day: '22', rentals: 9 },
    { day: '23', rentals: 8 },
    { day: '24', rentals: 10 },
    { day: '25', rentals: 11 },
    { day: '26', rentals: 9 },
    { day: '27', rentals: 12 },
    { day: '28', rentals: 10 },
    { day: '29', rentals: 11 },
    { day: '30', rentals: 13 },
  ]
};

// Chart configuration
const chartConfig = {
  views: {
    label: 'Views',
    theme: {
      light: '#0ea5e9',
      dark: '#0ea5e9',
    },
  },
  rentals: {
    label: 'Rentals',
    theme: {
      light: '#10b981',
      dark: '#10b981',
    },
  },
};

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Rentals
            </CardTitle>
            <Truck size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_STATS.totalRentals}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-emerald-600 flex items-center mr-1">
                <ArrowUp size={12} />
                +12%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Rentals
            </CardTitle>
            <Truck size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_STATS.activeRentals}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-emerald-600 flex items-center mr-1">
                <ArrowUp size={12} />
                +4%
              </span>
              from last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_STATS.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In your inventory
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Product Views
            </CardTitle>
            <Eye size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_STATS.productViews}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-red-600 flex items-center mr-1">
                <ArrowDown size={12} />
                -3%
              </span>
              from last week
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Monthly Charts - Each chart takes full width */}
      <div className="space-y-6">
        {/* Views Chart - Full Width */}
        <Card>
          <CardHeader>
            <CardTitle>Product Views - Last Month</CardTitle>
            <CardDescription>
              Daily views trend for your products
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer 
              config={chartConfig} 
              className="h-full"
            >
              <LineChart 
                data={MOCK_STATS.monthlyViews}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <XAxis 
                  dataKey="day" 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}`}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  width={30}
                  tick={{ fontSize: 12 }}
                />
                <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" vertical={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  name="views"
                  stroke="var(--color-views)" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        {/* Rentals Chart - Full Width */}
        <Card>
          <CardHeader>
            <CardTitle>Rentals - Last Month</CardTitle>
            <CardDescription>
              Daily rental transactions
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer 
              config={chartConfig} 
              className="h-full"
            >
              <LineChart 
                data={MOCK_STATS.monthlyRentals}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <XAxis 
                  dataKey="day" 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}`}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  width={30}
                  tick={{ fontSize: 12 }}
                />
                <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" vertical={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="rentals" 
                  name="rentals"
                  stroke="var(--color-rentals)" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Custom tooltip component for the charts
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = payload[0].value;
    const name = payload[0].name;
    
    return (
      <div className="bg-background border border-border rounded-md shadow-md p-2 text-xs">
        <p className="font-medium">Day {data.day}</p>
        <p className="text-foreground">
          {name === 'views' ? 'Views' : 'Rentals'}: <span className="font-medium">{value}</span>
        </p>
      </div>
    );
  }

  return null;
};

export default CompanyStats;
