
import { Link } from 'react-router-dom';
import { DashboardNavigationProps } from './navigation/types';
import DashboardNavigationContent from './navigation/DashboardNavigationContent';

/**
 * Navegación lateral del panel de control
 * Componente contenedor que proporciona el diseño y estructura para el contenido de navegación
 */
const DashboardNavigation = (props: DashboardNavigationProps) => {
  return (
    <div className="w-64 shrink-0 border-r border-border h-full flex flex-col">
      {/* Logo en la parte superior */}
      <div className="p-4 border-b border-border">
        <Link 
          to="/" 
          className="text-2xl font-display font-semibold tracking-tight text-primary transition-all duration-350"
        >
          appquilar
        </Link>
      </div>
      
      <DashboardNavigationContent {...props} />
    </div>
  );
};

export default DashboardNavigation;
