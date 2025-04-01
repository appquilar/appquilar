
import { useLocation } from 'react-router-dom';
import { useNavLinks } from './useNavLinks';
import { useIsMobile } from '@/hooks/use-mobile';
import { DashboardNavigationProps } from './types';
import UserProfile from './UserProfile';
import NavItem from './NavItem';
import CompanyNavSection from './CompanyNavSection';
import UpgradeLink from './UpgradeLink';
import { useState } from 'react';
import UpgradeToCompanyWizard from '../upgrade/UpgradeToCompanyWizard';

/**
 * Contenido principal de la navegación del panel de control
 */
const DashboardNavigationContent = ({ activeTab, onTabChange, onNavigate }: DashboardNavigationProps) => {
  const location = useLocation();
  const { navLinks, companyLinks, adminLinks, isCompanyUser, isAdmin } = useNavLinks();
  const isMobile = useIsMobile();
  const [upgradeWizardOpen, setUpgradeWizardOpen] = useState(false);

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

  const openUpgradeWizard = () => {
    setUpgradeWizardOpen(true);
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

          {/* Mostrar enlace a productos para usuarios normales */}
          {!isCompanyUser && (
            <NavItem
              link={{
                href: '/dashboard/products',
                title: 'Mis Productos',
                icon: navLinks[0].icon // Using the same icon style
              }}
              isActive={isActive('/dashboard/products')}
              onClick={handleTabChange}
            />
          )}
        </ul>
      </nav>
      
      {/* Enlace para actualizar a cuenta de empresa (justo antes del perfil) */}
      {!isCompanyUser && (
        <div className="px-2 mb-2">
          <UpgradeLink onClick={openUpgradeWizard} />
        </div>
      )}
      
      {/* Información del usuario/empresa en la parte inferior */}
      <div className="mt-auto">
        <UserProfile />
      </div>

      {/* Modal del asistente de actualización a empresa */}
      <UpgradeToCompanyWizard open={upgradeWizardOpen} onOpenChange={setUpgradeWizardOpen} />
    </div>
  );
};

export default DashboardNavigationContent;
