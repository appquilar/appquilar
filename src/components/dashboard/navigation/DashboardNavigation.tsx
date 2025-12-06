import {Link} from 'react-router-dom';
import {useIsMobile} from '@/hooks/use-mobile';
import {DashboardNavigationProps} from './types';
import DashboardNavigationContent from './DashboardNavigationContent';

/**
 * Navegación lateral del panel de control
 * Componente contenedor que proporciona el diseño y estructura para el contenido de navegación
 */
const DashboardNavigation = (props: DashboardNavigationProps) => {
  const isMobile = useIsMobile();

  return (
    <div className={`${isMobile ? 'w-full' : 'w-64'} h-full flex flex-col bg-background border-r border-border`}>
      {/* Logo en la parte superior */}
      <div className={`p-4 border-b border-border flex items-center ${isMobile ? 'h-16' : ''}`}>
        <Link 
          to="/" 
          className="text-2xl font-display font-semibold tracking-tight text-primary transition-all duration-350"
        >
          appquilar
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <DashboardNavigationContent {...props} />
      </div>
    </div>
  );
};

export default DashboardNavigation;
