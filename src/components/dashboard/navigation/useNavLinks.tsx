
import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { BarChart, Package, Calendar, MessageCircle, Users, Home, Settings } from 'lucide-react';

export interface NavLink {
  href: string;
  label: string;
  icon: ReactNode;
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
      label: 'Resumen',
      icon: <Home size={20} />,
      exact: true
    },
    {
      href: '/dashboard/rentals',
      label: 'Alquileres',
      icon: <Calendar size={20} />
    },
    {
      href: '/dashboard/messages',
      label: 'Mensajes',
      icon: <MessageCircle size={20} />
    },
    {
      href: '/dashboard/config',
      label: 'Configuración',
      icon: <Settings size={20} />
    }
  ];
  
  // Enlaces para usuarios de empresa
  const companyLinks: NavLink[] = [
    {
      href: '/dashboard/products',
      label: 'Productos',
      icon: <Package size={20} />
    },
    {
      href: '/dashboard/stats',
      label: 'Estadísticas',
      icon: <BarChart size={20} />
    }
  ];
  
  // Enlaces para administradores de empresa
  const adminLinks: NavLink[] = [
    {
      href: '/dashboard/users',
      label: 'Usuarios',
      icon: <Users size={20} />
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
