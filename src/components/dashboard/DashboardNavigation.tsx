
import { DashboardNavigationProps } from './navigation/types';
import DashboardNavigationContent from './navigation/DashboardNavigationContent';

/**
 * Navegación lateral del panel de control
 * Componente contenedor que proporciona el diseño y estructura para el contenido de navegación
 */
const DashboardNavigation = (props: DashboardNavigationProps) => {
  return (
    <div className="lg:w-64 lg:shrink-0 border-r border-border h-full overflow-auto">
      <DashboardNavigationContent {...props} />
    </div>
  );
};

export default DashboardNavigation;
