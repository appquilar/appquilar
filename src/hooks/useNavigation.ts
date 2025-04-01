
import { useAuth } from '@/context/AuthContext';
import { NavigationConfig } from '@/domain/services/navigation/NavigationConfig';
import { NavSection } from '@/domain/services/navigation/types';
import { useLocation } from 'react-router-dom';

/**
 * Hook that provides navigation data and helper functions
 */
export const useNavigation = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Get navigation sections based on user role
  const navSections = NavigationConfig.getSectionsForRole(user?.role);
  
  // Determine if a company upgrade is available
  const canUpgradeToCompany = user?.role === 'user';
  
  // Function to check if a link is active
  const isActive = (href: string, exact = false) => {
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return {
    navSections,
    canUpgradeToCompany,
    isActive,
    userRole: user?.role
  };
};
