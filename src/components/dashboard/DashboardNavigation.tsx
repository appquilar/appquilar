import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { DashboardNavigationProps } from './navigation/types';
import DashboardNavigationContent from './navigation/DashboardNavigationContent';
import AppLogo from '@/components/common/AppLogo';

/**
 * Navegación lateral del panel de control
 * Componente contenedor que proporciona el diseño y estructura para el contenido de navegación
 */
const DashboardNavigation = (props: DashboardNavigationProps) => {
    const isMobile = useIsMobile();

    return (
        <div className={`${isMobile ? 'w-full' : 'w-64'} h-full flex flex-col bg-background border-r border-border`}>
            {/* Logo en la parte superior */}
            <div className={`p-4 border-b border-border ${isMobile ? 'pt-16' : ''}`}>
                <Link
                    to="/"
                    className="flex items-center justify-center transition-opacity hover:opacity-90"
                    aria-label="Ir a inicio"
                >
                    <AppLogo
                        imageClassName="h-8 w-auto"
                        textClassName="text-2xl font-display font-semibold tracking-tight text-primary transition-all duration-350"
                    />
                </Link>
            </div>

            <DashboardNavigationContent {...props} />
        </div>
    );
};

export default DashboardNavigation;
