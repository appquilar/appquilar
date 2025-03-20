
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Calendar, 
  Users, 
  Settings, 
  ChevronRight,
  MessageCircle
} from 'lucide-react';

/**
 * Navegación lateral del panel de control
 */
const DashboardNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isCompanyUser = user?.role === 'company_admin' || user?.role === 'company_user';

  // Enlaces de navegación
  const navLinks = [
    {
      title: 'Panel General',
      href: '/dashboard',
      icon: <LayoutDashboard size={18} />,
      exact: true,
    },
    {
      title: 'Mensajes',
      href: '/dashboard/messages',
      icon: <MessageCircle size={18} />,
      badge: '2',
    },
  ];

  // Enlaces adicionales para usuarios de tipo empresa
  const companyLinks = [
    {
      title: 'Productos',
      href: '/dashboard/products',
      icon: <Package size={18} />,
    },
    {
      title: 'Alquileres',
      href: '/dashboard/rentals',
      icon: <Calendar size={18} />,
      badge: '5',
    },
  ];

  // Enlaces adicionales para administradores de empresa
  const adminLinks = [
    {
      title: 'Usuarios',
      href: '/dashboard/users',
      icon: <Users size={18} />,
    },
    {
      title: 'Configuración',
      href: '/dashboard/settings',
      icon: <Settings size={18} />,
    },
  ];

  // Función para verificar si un enlace está activo
  const isActive = (href: string, exact = false) => {
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="lg:w-64 lg:shrink-0 border-r border-border h-full overflow-auto">
      {/* Información del usuario/empresa */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="font-medium text-sm truncate">
              {user?.name || 'Usuario'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isCompanyUser 
                ? `${user?.companyName || 'Empresa'} - ${user?.role === 'company_admin' ? 'Admin' : 'Usuario'}`
                : 'Cuenta Personal'}
            </p>
          </div>
        </div>
      </div>

      {/* Enlaces de navegación */}
      <nav className="p-2">
        <ul className="space-y-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                to={link.href}
                className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                  isActive(link.href, link.exact)
                    ? 'bg-secondary text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-3">{link.icon}</span>
                  <span>{link.title}</span>
                </div>
                {link.badge && (
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-1.5 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}

          {/* Enlaces para usuarios de empresa */}
          {isCompanyUser && (
            <>
              <li className="mt-6 mb-2 px-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Gestión
                </p>
              </li>
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                      isActive(link.href)
                        ? 'bg-secondary text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="mr-3">{link.icon}</span>
                      <span>{link.title}</span>
                    </div>
                    {link.badge && (
                      <span className="bg-primary text-primary-foreground text-xs font-medium px-1.5 py-0.5 rounded-full">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </>
          )}

          {/* Enlaces para administradores de empresa */}
          {user?.role === 'company_admin' && (
            <>
              <li className="mt-6 mb-2 px-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Administración
                </p>
              </li>
              {adminLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                      isActive(link.href)
                        ? 'bg-secondary text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="mr-3">{link.icon}</span>
                      <span>{link.title}</span>
                    </div>
                    {link.badge && (
                      <span className="bg-primary text-primary-foreground text-xs font-medium px-1.5 py-0.5 rounded-full">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </>
          )}

          {/* Enlace para actualizar a cuenta de empresa */}
          {!isCompanyUser && (
            <li className="mt-6">
              <Link
                to="/dashboard/upgrade"
                className="flex items-center justify-between px-3 py-3 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <span className="text-sm font-medium">Actualizar a Empresa</span>
                <ChevronRight size={16} />
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default DashboardNavigation;
