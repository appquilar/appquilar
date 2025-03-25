
import { ReactNode } from 'react';

/**
 * Props para el componente de navegación del panel de control
 */
export interface DashboardNavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onNavigate?: () => void;
}

/**
 * Tipo para los enlaces de navegación
 */
export interface NavLink {
  title: string;
  href: string;
  icon: ReactNode;
  badge?: string;
  exact?: boolean;
}
