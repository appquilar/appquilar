
import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { BarChart, Package, Calendar, MessageCircle, Users, Home, Settings, Building, Globe } from 'lucide-react';

export interface NavLink {
  href: string;
  title: string; // Changed from label to title
  icon: ReactNode;
  badge?: string; // Added to match the types.ts interface
  exact?: boolean;
}

export const useNavLinks = () => {
  const { user } = useAuth();
  const isCompanyUser = user?.role === 'company_admin' || user?.role === 'company_user';
  const isAdmin = user?.role === 'company_admin';
  
  // Enlaces básicos para todos los usuarios
  const navLinks: NavLink[] = [
    {
      href: '/dashboard',
      title: 'Resumen',
      icon: <Home size={20} />,
      exact: true
    },
    {
      href: '/dashboard/rentals',
      title: 'Alquileres',
      icon: <Calendar size={20} />
    },
    {
      href: '/dashboard/messages',
      title: 'Mensajes',
      icon: <MessageCircle size={20} />
    }
  ];
  
  // Enlaces para usuarios de empresa
  const companyLinks: NavLink[] = [
    {
      href: '/dashboard/products',
      title: 'Productos',
      icon: <Package size={20} />
    },
    {
      href: '/dashboard/stats',
      title: 'Estadísticas',
      icon: <BarChart size={20} />
    },
    {
      href: '/dashboard/categories',
      title: 'Categorías',
      icon: <Package size={20} />
    }
  ];
  
  // Enlaces para administradores de empresa
  const adminLinks: NavLink[] = [
    {
      href: '/dashboard/users',
      title: 'Usuarios',
      icon: <Users size={20} />
    },
    {
      href: '/dashboard/companies',
      title: 'Empresas',
      icon: <Building size={20} />
    },
    {
      href: '/dashboard/sites',
      title: 'Sitios',
      icon: <Globe size={20} />
    },
    {
      href: '/dashboard/config',
      title: 'Configuración',
      icon: <Settings size={20} />
    }
  ];
  
  return {
    navLinks,
    companyLinks,
    adminLinks,
    isCompanyUser,
    isAdmin
  };
};
