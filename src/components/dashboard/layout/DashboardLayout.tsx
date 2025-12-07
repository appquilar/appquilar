import React from 'react';
import {SidebarInset, SidebarProvider, useSidebar} from '@/components/ui/sidebar';
import {Button} from '@/components/ui/button';
import {Menu} from 'lucide-react';

interface DashboardLayoutProps {
    sidebar: React.ReactNode;
    content: React.ReactNode;
}

/**
 * Inner layout content to access the sidebar context
 */
const DashboardLayoutContent = ({ sidebar, content }: DashboardLayoutProps) => {
    const { toggleSidebar, isMobile } = useSidebar();

    return (
        <div className="flex min-h-svh w-full">
            {/* The Sidebar component (passed as prop) will handle its own rendering/state */}
            {sidebar}

            {/* Main Content Area */}
            <SidebarInset className="flex flex-col flex-1 w-full overflow-hidden">

                {/* Mobile Header / Trigger */}
                {isMobile && (
                    <header className="flex items-center border-b px-4 h-14 shrink-0 bg-background gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleSidebar}
                            className="-ml-2"
                        >
                            <Menu size={20} />
                        </Button>
                        <div className="text-xl font-display font-semibold tracking-tight text-primary">
                            appquilar
                        </div>
                    </header>
                )}

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {content}
                </main>
            </SidebarInset>
        </div>
    );
};

/**
 * Root Layout that provides the Sidebar Context
 */
const DashboardLayout = (props: DashboardLayoutProps) => {
    return (
        <SidebarProvider defaultOpen={true}>
            <DashboardLayoutContent {...props} />
        </SidebarProvider>
    );
};

export default DashboardLayout;