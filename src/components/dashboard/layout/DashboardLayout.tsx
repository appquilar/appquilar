import React from 'react';
import { Link } from "react-router-dom";
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import AppLogo from "@/components/common/AppLogo";

interface DashboardLayoutProps {
    sidebar: React.ReactNode;
    content: React.ReactNode;
}

/**
 * Inner layout content to access the sidebar context
 */
const DashboardLayoutContent = ({ sidebar, content }: DashboardLayoutProps) => {
    const { toggleSidebar, isMobile } = useSidebar();

    React.useEffect(() => {
        document.body.classList.add("dashboard-premium-active");

        return () => {
            document.body.classList.remove("dashboard-premium-active");
        };
    }, []);

    return (
        <div className="dashboard-premium flex min-h-svh w-full font-sans text-[#0F172A]">
            {/* The Sidebar component (passed as prop) will handle its own rendering/state */}
            {sidebar}

            {/* Main Content Area */}
            <SidebarInset className="dashboard-main-shell flex flex-col flex-1 w-full overflow-hidden">

                {/* Mobile Header / Trigger */}
                {isMobile && (
                    <header className="flex items-center border-b border-slate-200/80 px-4 h-16 shrink-0 bg-white/75 backdrop-blur-md gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleSidebar}
                            className="-ml-1 rounded-lg border border-slate-200/80 bg-white/80 shadow-sm"
                            aria-label="Abrir/cerrar menú"
                        >
                            <Menu size={20} />
                        </Button>

                        <Link
                            to="/"
                            className="flex items-center transition-opacity hover:opacity-90"
                            aria-label="Ir a inicio"
                        >
                            <AppLogo
                                imageClassName="h-7 w-auto"
                                textClassName="text-xl font-display font-semibold tracking-tight text-primary"
                            />
                        </Link>
                    </header>
                )}

                {/* Page Content */}
                <main className="dashboard-main-content flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5">
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
        <SidebarProvider defaultOpen={true} className="dashboard-sidebar-provider">
            <DashboardLayoutContent {...props} />
        </SidebarProvider>
    );
};

export default DashboardLayout;
