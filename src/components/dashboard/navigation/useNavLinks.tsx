
import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Calendar, 
  Users, 
  Settings,
  MessageCircle
} from 'lucide-react';
import { NavLink } from './types';

/**
 * Hook personalizado para obtener los enlaces de navegación según el rol del usuario
 */
export const useNavLinks = () => {
  const { user } = useAuth();
  const isCompanyUser = user?.role === 'company_admin' || user?.role === 'company_user';

  // Enlaces de navegación básicos
  const navLinks: NavLink[] = [
    {
      title: 'Panel',
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
  const companyLinks: NavLink[] = [
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
  const adminLinks: NavLink[] = [
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

  return {
    navLinks,
    companyLinks,
    adminLinks,
    isCompanyUser,
    isAdmin: user?.role === 'company_admin'
  };
};
