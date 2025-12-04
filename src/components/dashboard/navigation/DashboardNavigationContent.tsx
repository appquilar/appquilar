import {useNavigate} from 'react-router-dom';
import {useIsMobile} from '@/hooks/use-mobile';
import {DashboardNavigationProps} from './types';
import UserProfile from './UserProfile';
import NavSection from './NavSection';
import UpgradeLink from './UpgradeLink';
import {useNavigation} from '@/hooks/useNavigation';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {MapPin} from 'lucide-react';

/**
 * Contenido principal de la navegación del panel de control
 */
const DashboardNavigationContent = ({ activeTab, onTabChange, onNavigate }: DashboardNavigationProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { navSections, canUpgradeToCompany, isActive } = useNavigation();
  const hasAddress = false;

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
          {/* Render all sections */}
          {navSections.map((section) => (
            <NavSection
              key={section.id}
              title={section.title}
              items={section.items}
              isActive={isActive}
              onTabChange={handleTabChange}
            />
          ))}
        </ul>
      </nav>
      
      {/* Alerta de dirección vacía */}
      {!hasAddress && (
        <div className="px-2 mb-2">
          <Alert 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate('/dashboard/config?tab=address')}
          >
            <MapPin className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Añade tu dirección en Configuración
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {/* Enlace para actualizar a cuenta de empresa (justo antes del perfil) */}
      {canUpgradeToCompany && (
        <div className="px-2 mb-2">
          <UpgradeLink />
        </div>
      )}
      
      {/* Información del usuario/empresa en la parte inferior */}
      <div className="mt-auto">
        <UserProfile />
      </div>
    </div>
  );
};

export default DashboardNavigationContent;
