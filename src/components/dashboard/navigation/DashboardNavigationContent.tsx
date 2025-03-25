
import { useLocation } from 'react-router-dom';
import { useNavLinks } from './useNavLinks';
import { useIsMobile } from '@/hooks/use-mobile';
import { DashboardNavigationProps } from './types';
import UserProfile from './UserProfile';
import NavItem from './NavItem';
import CompanyNavSection from './CompanyNavSection';
import UpgradeLink from './UpgradeLink';

/**
 * Contenido principal de la navegación del panel de control
 */
const DashboardNavigationContent = ({ activeTab, onTabChange, onNavigate }: DashboardNavigationProps) => {
  const location = useLocation();
  const { navLinks, companyLinks, adminLinks, isCompanyUser, isAdmin } = useNavLinks();
  const isMobile = useIsMobile();

  // Función para verificar si un enlace está activo
  const isActive = (href: string, exact = false) => {
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  // Manejador de clic para cambiar pestañas
  const handleTabChange = (href: string) => {
    // Extraer la última parte de la URL como identificador de pestaña, o 'overview' para la ruta principal
    const tabName = href === '/dashboard' ? 'overview' : href.split('/').pop() || 'overview';
    if (onTabChange) onTabChange(tabName);
    if (onNavigate) onNavigate();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Enlaces de navegación */}
      <nav className={`p-2 flex-grow ${isMobile ? 'py-4' : ''}`}>
        <ul className="space-y-1">
          {/* Enlaces básicos */}
          {navLinks.map((link) => (
            <NavItem
              key={link.href}
              link={link}
              isActive={isActive(link.href, link.exact)}
              onClick={handleTabChange}
            />
          ))}

          {/* Enlaces para usuarios de empresa */}
          {isCompanyUser && (
            <CompanyNavSection
              links={companyLinks}
              title="Gestión"
              isActive={isActive}
              onTabChange={handleTabChange}
            />
          )}

          {/* Enlaces para administradores de empresa */}
          {isAdmin && (
            <CompanyNavSection
              links={adminLinks}
              title="Administración"
              isActive={isActive}
              onTabChange={handleTabChange}
            />
          )}

          {/* Enlace para actualizar a cuenta de empresa */}
          {!isCompanyUser && <UpgradeLink />}
        </ul>
      </nav>
      
      {/* Información del usuario/empresa en la parte inferior */}
      <div className="mt-auto">
        <UserProfile />
      </div>
    </div>
  );
};

export default DashboardNavigationContent;
