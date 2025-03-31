
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface DashboardLayoutProps {
  sidebar: React.ReactNode;
  content: React.ReactNode;
}

/**
 * Layout component for the dashboard that handles responsive sidebar and content
 */
const DashboardLayout = ({ sidebar, content }: DashboardLayoutProps) => {
  const isMobile = useIsMobile();
  const [showSidebar, setShowSidebar] = React.useState(!isMobile);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Mobile menu toggle and header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center bg-background border-b border-border h-14 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <Menu size={20} />
          </Button>
          <div className="mx-auto text-xl font-display font-semibold tracking-tight text-primary">
            appquilar
          </div>
          <div className="w-9"></div> {/* Spacer for balance */}
        </div>
      )}

      {/* Sidebar navigation */}
      <div 
        className={`${
          isMobile 
            ? `fixed inset-0 z-40 transform ${showSidebar ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`
            : 'relative'
        }`}
      >
        {React.cloneElement(sidebar as React.ReactElement, { 
          onNavigate: () => isMobile && setShowSidebar(false) 
        })}
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
        <div className={`${isMobile ? 'pt-16' : ''} h-full p-6`}>
          {content}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
