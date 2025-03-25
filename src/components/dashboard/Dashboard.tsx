
import React, { useState } from 'react';
import DashboardNavigation from './DashboardNavigation';
import DashboardRoutes from './DashboardRoutes';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu } from 'lucide-react';
import { Button } from '../ui/button';

const Dashboard = () => {
  const isMobile = useIsMobile();
  const [showSidebar, setShowSidebar] = useState(!isMobile);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Mobile menu toggle */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          <Menu size={20} />
        </Button>
      )}

      {/* Sidebar navigation */}
      <div 
        className={`${
          isMobile 
            ? `fixed inset-0 z-40 transform ${showSidebar ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`
            : 'relative'
        }`}
      >
        <DashboardNavigation 
          onNavigate={() => isMobile && setShowSidebar(false)}
        />
      </div>

      {/* Mobile sidebar backdrop */}
      {isMobile && showSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-grow overflow-y-auto">
        <div className={`${isMobile ? 'pt-14' : ''} h-full`}>
          <DashboardRoutes />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
