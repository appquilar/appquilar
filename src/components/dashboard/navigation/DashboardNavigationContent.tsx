
import { useLocation } from 'react-router-dom';
import { useNavLinks } from './useNavLinks';
import { DashboardNavigationProps } from './types';
import UserProfile from './UserProfile';
import NavItem from './NavItem';
import CompanyNavSection from './CompanyNavSection';
import UpgradeLink from './UpgradeLink';

/**
 * Contenido principal de la navegación del panel de control
 */
const DashboardNavigationContent = ({ activeTab, onTabChange }: DashboardNavigationProps) => {
  const location = useLocation();
  const { navLinks, companyLinks, adminLinks, isCompanyUser, isAdmin } = useNavLinks();

  // Función para verificar si un enlace está activo
  const isActive = (href: string, exact = false) => {
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  // Manejador de clic para cambiar pestañas
  const handleTabChange = (href: string) => {
    // Extraer la última parte de la URL para usarla como identificador de pestaña
    const tabName = href.split('/').pop() || 'overview';
    onTabChange(tabName);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Enlaces de navegación */}
      <nav className="p-2 flex-grow">
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
