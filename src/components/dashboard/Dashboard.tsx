
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardNavigation from './DashboardNavigation';
import RentalsManagement from './RentalsManagement';
import ProductsManagement from './ProductsManagement';
import CompanyStats from './CompanyStats';
import UserManagement from './UserManagement';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type DashboardTab = 'overview' | 'rentals' | 'products' | 'users' | 'settings';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { user, upgradeToCompany } = useAuth();
  const navigate = useNavigate();

  const handleUpgradeAccount = async () => {
    if (!companyName.trim()) {
      toast.error('Please enter a company name');
      return;
    }
    
    setIsUpgrading(true);
    
    try {
      await upgradeToCompany(companyName);
      toast.success('Account upgraded to company successfully');
      setUpgradeModalOpen(false);
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Failed to upgrade account. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex">
      {/* Dashboard navigation */}
      <DashboardNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Main content */}
      <main className="flex-1 px-4 py-6 animate-fade-in">
        <div className="max-w-6xl mx-auto">
          {/* User is not a company */}
          {user && user.role === 'user' ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
              <h1 className="text-3xl font-display font-semibold mb-4">Upgrade to Company Account</h1>
              <p className="text-muted-foreground max-w-md mb-8">
                As a company, you can list your tools for rent, manage rentals, and grow your business on our platform.
              </p>
              <Button onClick={() => setUpgradeModalOpen(true)}>
                Upgrade Now
              </Button>
            </div>
          ) : (
            <>
              {/* Company dashboard content */}
              {activeTab === 'overview' && <CompanyStats />}
              {activeTab === 'rentals' && <RentalsManagement />}
              {activeTab === 'products' && <ProductsManagement />}
              {activeTab === 'users' && <UserManagement />}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-display font-semibold">Account Settings</h1>
                  <p>Settings content will go here.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      {/* Upgrade to company modal */}
      <Dialog open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upgrade to Company Account</DialogTitle>
            <DialogDescription>
              Enter your company details to create a business profile and start renting your tools.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="company-name" className="text-sm font-medium">
                Company Name
              </label>
              <Input
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Pro Tools Rental"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpgradeAccount} disabled={isUpgrading}>
              {isUpgrading ? 'Upgrading...' : 'Upgrade Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
