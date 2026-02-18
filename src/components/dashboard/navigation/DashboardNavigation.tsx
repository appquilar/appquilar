import { Link } from 'react-router-dom';
import { DashboardNavigationProps } from './types';
import DashboardNavigationContent from './DashboardNavigationContent';
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';
import AppLogo from '@/components/common/AppLogo';

/**
 * Sidebar Navigation Component
 * Converted to use Shadcn UI Sidebar primitives
 */
const DashboardNavigation = (props: DashboardNavigationProps) => {
    return (
        <Sidebar collapsible="icon" variant="floating" className="dashboard-sidebar-shell">
            <SidebarHeader className="h-20 flex justify-center px-5 border-b border-slate-200/60">
                <Link
                    to="/"
                    aria-label="Ir a inicio"
                    className="flex items-center justify-center transition-opacity hover:opacity-90"
                >
                    {/*
            - En modo normal (expandido): logo de tamaño estándar
            - En modo colapsado: logo compacto pero visible
          */}
                    <div className="group-data-[collapsible=icon]:hidden">
                        <AppLogo
                            imageClassName="h-9 w-auto"
                            textClassName="text-2xl font-display font-semibold tracking-tight text-primary"
                        />
                    </div>

                    <div className="hidden group-data-[collapsible=icon]:block">
                        <AppLogo
                            imageClassName="h-7 w-auto"
                            textClassName="text-xl font-display font-semibold tracking-tight text-primary"
                        />
                    </div>
                </Link>
            </SidebarHeader>

            <SidebarContent>
                {/* Main navigation links */}
                <DashboardNavigationContent {...props} />
            </SidebarContent>

            <SidebarRail />
        </Sidebar>
    );
};

export default DashboardNavigation;
