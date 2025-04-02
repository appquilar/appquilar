
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
          icon: Home,
          exact: true
        },
        {
          id: 'rentals',
          href: '/dashboard/rentals',
          title: 'Alquileres',
          icon: Calendar
        },
        {
          id: 'messages',
          href: '/dashboard/messages',
          title: 'Mensajes',
          icon: MessageCircle
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
            icon: Package
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
            icon: Package
          },
          {
            id: 'stats',
            href: '/dashboard/stats',
            title: 'Estadísticas',
            icon: BarChart
          },
          {
            id: 'categories',
            href: '/dashboard/categories',
            title: 'Categorías',
            icon: Package
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
            icon: Users
          },
          {
            id: 'companies',
            href: '/dashboard/companies',
            title: 'Empresas',
            icon: Building
          },
          {
            id: 'sites',
            href: '/dashboard/sites',
            title: 'Sitios',
            icon: Globe
          },
          {
            id: 'config',
            href: '/dashboard/config',
            title: 'Configuración',
            icon: Settings
          }
        ]
      });
    }

    return sections;
  }
}
