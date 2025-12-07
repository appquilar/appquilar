import {Link} from 'react-router-dom';
import {DashboardNavigationProps} from './types';
import DashboardNavigationContent from './DashboardNavigationContent';
import {Sidebar, SidebarContent, SidebarHeader, SidebarRail} from '@/components/ui/sidebar';

/**
 * Sidebar Navigation Component
 * Converted to use Shadcn UI Sidebar primitives
 */
const DashboardNavigation = (props: DashboardNavigationProps) => {
    return (
        <Sidebar collapsible="icon" className="border-r">
            <SidebarHeader className="h-16 flex justify-center px-4 border-b">
                <Link
                    to="/"
                    className="flex items-center gap-2 font-display font-semibold tracking-tight text-primary transition-all duration-300 group-data-[collapsible=icon]:scale-0 group-data-[collapsible=icon]:w-0"
                >
                    <span className="text-2xl">appquilar</span>
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