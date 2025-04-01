
import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { BarChart, Package, Calendar, MessageCircle, Users, Home, Settings } from 'lucide-react';

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
      title: 'Resumen', // Changed from label to title
      icon: <Home size={20} />,
      exact: true
    },
    {
      href: '/dashboard/rentals',
      title: 'Alquileres', // Changed from label to title
      icon: <Calendar size={20} />
    },
    {
      href: '/dashboard/messages',
      title: 'Mensajes', // Changed from label to title
      icon: <MessageCircle size={20} />
    },
    {
      href: '/dashboard/config',
      title: 'Configuración', // Changed from label to title
      icon: <Settings size={20} />
    }
  ];
  
  // Enlaces para usuarios de empresa
  const companyLinks: NavLink[] = [
    {
      href: '/dashboard/products',
      title: 'Productos', // Changed from label to title
      icon: <Package size={20} />
    },
    {
      href: '/dashboard/stats',
      title: 'Estadísticas', // Changed from label to title
      icon: <BarChart size={20} />
    }
  ];
  
  // Enlaces para administradores de empresa
  const adminLinks: NavLink[] = [
    {
      href: '/dashboard/users',
      title: 'Usuarios', // Changed from label to title
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
