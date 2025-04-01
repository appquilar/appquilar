
import { UserRole } from "@/domain/models/UserRole";
import { NavSection } from "./types";
import { Home, Package, Calendar, MessageCircle, BarChart, Globe, Users, Building, Settings } from 'lucide-react';

/**
 * Navigation configuration factory - centralizes all navigation definitions
 * and associates them with specific user roles
 */
export class NavigationConfig {
  /**
   * Get all navigation sections for a particular user role
   */
  static getSectionsForRole(userRole?: string): NavSection[] {
    const sections: NavSection[] = [];

    // Core navigation - available to all authenticated users
    sections.push({
      id: 'core',
      title: null, // No title for core section
      requiredRole: UserRole.USER,
      items: [
        {
          id: 'overview',
          href: '/dashboard',
          title: 'Resumen',
          icon: <Home size={20} />,
          exact: true
        },
        {
          id: 'rentals',
          href: '/dashboard/rentals',
          title: 'Alquileres',
          icon: <Calendar size={20} />
        },
        {
          id: 'messages',
          href: '/dashboard/messages',
          title: 'Mensajes',
          icon: <MessageCircle size={20} />
        }
      ]
    });

    // Regular user products section
    if (userRole === UserRole.USER) {
      sections.push({
        id: 'user-products',
        title: null,
        requiredRole: UserRole.USER,
        items: [
          {
            id: 'products',
            href: '/dashboard/products',
            title: 'Mis Productos',
            icon: <Package size={20} />
          }
        ]
      });
    }

    // Company management - only for company users and admins
    if (userRole === UserRole.COMPANY_USER || userRole === UserRole.COMPANY_ADMIN) {
      sections.push({
        id: 'company-management',
        title: 'Gestión',
        requiredRole: UserRole.COMPANY_USER,
        items: [
          {
            id: 'products',
            href: '/dashboard/products',
            title: 'Productos',
            icon: <Package size={20} />
          },
          {
            id: 'stats',
            href: '/dashboard/stats',
            title: 'Estadísticas',
            icon: <BarChart size={20} />
          },
          {
            id: 'categories',
            href: '/dashboard/categories',
            title: 'Categorías',
            icon: <Package size={20} />
          }
        ]
      });
    }

    // Admin section - only for company admins
    if (userRole === UserRole.COMPANY_ADMIN || userRole === UserRole.SUPER_ADMIN) {
      sections.push({
        id: 'admin',
        title: 'Administración',
        requiredRole: UserRole.COMPANY_ADMIN,
        items: [
          {
            id: 'users',
            href: '/dashboard/users',
            title: 'Usuarios',
            icon: <Users size={20} />
          },
          {
            id: 'companies',
            href: '/dashboard/companies',
            title: 'Empresas',
            icon: <Building size={20} />
          },
          {
            id: 'sites',
            href: '/dashboard/sites',
            title: 'Sitios',
            icon: <Globe size={20} />
          },
          {
            id: 'config',
            href: '/dashboard/config',
            title: 'Configuración',
            icon: <Settings size={20} />
          }
        ]
      });
    }

    return sections;
  }
}
