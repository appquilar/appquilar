
import { ArrowDown, ArrowUp, Eye, Package, Truck, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

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
  ]
};

const CompanyStats = () => {
  const { user } = useAuth();
  
  if (!user || (user.role !== 'company_admin' && user.role !== 'company_user')) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.name}. Here's an overview of your company's performance.</p>
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
      
      {/* Popular products and recent rentals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Popular Products</CardTitle>
            <CardDescription>
              Your most viewed and rented products this month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_STATS.popularProducts.map((product, index) => (
                <div key={product.id} className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="mr-3 bg-primary/10 w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center mr-3">
                          <Eye size={12} className="mr-1" />
                          {product.views} views
                        </span>
                        <span>
                          <Truck size={12} className="inline mr-1" />
                          {product.rentals} rentals
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Rentals</CardTitle>
            <CardDescription>
              Your most recent rental transactions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_STATS.recentRentals.map((rental) => (
                <div key={rental.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between mb-1">
                    <p className="font-medium">{rental.product}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      rental.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {rental.status === 'active' ? 'Active' : 'Completed'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users size={14} className="mr-1" />
                    <span>{rental.customer}</span>
                    <span className="mx-1">•</span>
                    <span>{rental.days} days</span>
                    <span className="mx-1">•</span>
                    <span>From {rental.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyStats;
