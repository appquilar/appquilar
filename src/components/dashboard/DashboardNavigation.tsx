
import { Link } from 'react-router-dom';
import { Home, FileText, Package, Users, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';

type DashboardTab = 'overview' | 'rentals' | 'products' | 'users' | 'settings';

interface DashboardNavigationProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

const DashboardNavigation = ({ activeTab, onTabChange }: DashboardNavigationProps) => {
  const { user, logout } = useAuth();
  
  return (
    <div className="w-64 border-r border-border h-[calc(100vh-5rem)] sticky top-20 hidden md:block">
      <div className="p-4 h-full flex flex-col">
        {/* User info */}
        <div className="py-4">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
              {user?.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-medium">{user?.name}</h3>
              <p className="text-xs text-muted-foreground">
                {user?.role === 'company_admin' 
                  ? 'Company Admin' 
                  : user?.role === 'company_user' 
                    ? 'Company Staff' 
                    : 'User'
                }
              </p>
            </div>
          </div>
          {user?.companyName && (
            <div className="bg-secondary rounded-md p-2 text-xs">
              <span className="block text-muted-foreground">Company</span>
              <span className="font-medium">{user.companyName}</span>
            </div>
          )}
        </div>
        
        <Separator />
        
        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1">
          <Button
            variant={activeTab === 'overview' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onTabChange('overview')}
          >
            <Home size={16} className="mr-2" />
            Overview
          </Button>
          
          <Button
            variant={activeTab === 'rentals' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onTabChange('rentals')}
          >
            <FileText size={16} className="mr-2" />
            Rentals
          </Button>
          
          <Button
            variant={activeTab === 'products' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onTabChange('products')}
          >
            <Package size={16} className="mr-2" />
            Products
          </Button>
          
          {user?.role === 'company_admin' && (
            <Button
              variant={activeTab === 'users' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => onTabChange('users')}
            >
              <Users size={16} className="mr-2" />
              Users
            </Button>
          )}
          
          <Button
            variant={activeTab === 'settings' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onTabChange('settings')}
          >
            <Settings size={16} className="mr-2" />
            Settings
          </Button>
        </nav>
        
        <Separator />
        
        {/* Footer */}
        <div className="pt-4">
          <Button 
            variant="ghost" 
            className="w-full justify-start" 
            onClick={logout}
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
          
          <div className="mt-4 text-xs text-muted-foreground">
            <Link to="/" className="hover:underline">
              Back to Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardNavigation;
