
import { useState } from 'react';
import { Calendar, Filter, Search, Truck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Mock rental data - would come from backend API in production
const MOCK_RENTALS = [
  {
    id: '1',
    product: 'Hammer Drill 20V',
    customer: {
      id: 'c1',
      name: 'John Smith',
      email: 'john@example.com',
      phone: '123-456-7890'
    },
    startDate: '2023-07-15',
    endDate: '2023-07-18',
    status: 'active',
    totalAmount: 75.00,
    returned: false
  },
  {
    id: '2',
    product: 'Table Saw with Stand',
    customer: {
      id: 'c2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '234-567-8901'
    },
    startDate: '2023-07-12',
    endDate: '2023-07-19',
    status: 'active',
    totalAmount: 245.00,
    returned: false
  },
  {
    id: '3',
    product: 'Landscaping Tool Set',
    customer: {
      id: 'c3',
      name: 'Michael Brown',
      email: 'michael@example.com',
      phone: '345-678-9012'
    },
    startDate: '2023-07-10',
    endDate: '2023-07-12',
    status: 'completed',
    totalAmount: 40.00,
    returned: true
  },
  {
    id: '4',
    product: '48" Concrete Bull Float',
    customer: {
      id: 'c4',
      name: 'Emily Wilson',
      email: 'emily@example.com',
      phone: '456-789-0123'
    },
    startDate: '2023-07-18',
    endDate: '2023-07-20',
    status: 'upcoming',
    totalAmount: 56.00,
    returned: false
  },
  {
    id: '5',
    product: 'Folding Banquet Tables',
    customer: {
      id: 'c5',
      name: 'David Thompson',
      email: 'david@example.com',
      phone: '567-890-1234'
    },
    startDate: '2023-07-16',
    endDate: '2023-07-18',
    status: 'active',
    totalAmount: 80.00,
    returned: false
  },
  {
    id: '6',
    product: 'Commercial Carpet Cleaner',
    customer: {
      id: 'c6',
      name: 'Lisa Anderson',
      email: 'lisa@example.com',
      phone: '678-901-2345'
    },
    startDate: '2023-07-05',
    endDate: '2023-07-10',
    status: 'completed',
    totalAmount: 225.00,
    returned: true
  },
];

const RentalsManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Filter rentals based on search query and active tab
  const filteredRentals = MOCK_RENTALS.filter(rental => {
    const matchesSearch = searchQuery 
      ? rental.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rental.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    const matchesTab = activeTab === 'all' 
      ? true 
      : rental.status === activeTab;
    
    return matchesSearch && matchesTab;
  });
  
  // Count rentals by status
  const rentalCounts = {
    all: MOCK_RENTALS.length,
    active: MOCK_RENTALS.filter(r => r.status === 'active').length,
    upcoming: MOCK_RENTALS.filter(r => r.status === 'upcoming').length,
    completed: MOCK_RENTALS.filter(r => r.status === 'completed').length,
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we might call an API endpoint here
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold">Rentals Management</h1>
        <p className="text-muted-foreground">Track and manage all your equipment rentals.</p>
      </div>
      
      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search rentals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </form>
        <Button variant="outline" className="gap-2 sm:w-auto w-full">
          <Filter size={16} />
          Filters
        </Button>
        <Button className="gap-2 sm:w-auto w-full">
          <Calendar size={16} />
          Calendar View
        </Button>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            All
            <Badge variant="secondary" className="ml-2">{rentalCounts.all}</Badge>
          </TabsTrigger>
          <TabsTrigger value="active">
            Active
            <Badge variant="secondary" className="ml-2">{rentalCounts.active}</Badge>
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming
            <Badge variant="secondary" className="ml-2">{rentalCounts.upcoming}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
            <Badge variant="secondary" className="ml-2">{rentalCounts.completed}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <RentalsList rentals={filteredRentals} />
        </TabsContent>
        
        <TabsContent value="active" className="mt-6">
          <RentalsList rentals={filteredRentals} />
        </TabsContent>
        
        <TabsContent value="upcoming" className="mt-6">
          <RentalsList rentals={filteredRentals} />
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          <RentalsList rentals={filteredRentals} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface RentalsListProps {
  rentals: typeof MOCK_RENTALS;
}

const RentalsList = ({ rentals }: RentalsListProps) => {
  if (rentals.length === 0) {
    return (
      <div className="text-center py-10">
        <Truck size={40} className="mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-1">No rentals found</h3>
        <p className="text-muted-foreground">Try adjusting your search or filters.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {rentals.map((rental) => (
        <Card key={rental.id} className="hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between py-5">
            <div>
              <CardTitle className="text-base font-medium">{rental.product}</CardTitle>
              <p className="text-sm text-muted-foreground">Rental #{rental.id}</p>
            </div>
            <Badge
              className={`${
                rental.status === 'active' 
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' 
                  : rental.status === 'upcoming'
                    ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
              }`}
            >
              {rental.status === 'active' 
                ? 'Active' 
                : rental.status === 'upcoming' 
                  ? 'Upcoming' 
                  : 'Completed'
              }
            </Badge>
          </CardHeader>
          <CardContent className="pt-0 pb-5 px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Customer</p>
                <p className="font-medium">{rental.customer.name}</p>
                <p className="text-sm text-muted-foreground">{rental.customer.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Rental Period</p>
                <p className="font-medium">{rental.startDate} to {rental.endDate}</p>
                <p className="text-sm text-muted-foreground">
                  {Math.ceil((new Date(rental.endDate).getTime() - new Date(rental.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Amount</p>
                <p className="font-medium">${rental.totalAmount.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  {rental.returned ? 'Returned' : 'Not returned'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4 justify-end">
              <Button variant="outline" size="sm">View Details</Button>
              {rental.status === 'active' && (
                <Button size="sm">Mark as Returned</Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RentalsManagement;
