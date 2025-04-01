
/**
 * Enum defining the possible user roles in the system
 */
export enum UserRole {
  USER = 'user',
  COMPANY_USER = 'company_user',
  COMPANY_ADMIN = 'company_admin',
  SUPER_ADMIN = 'super_admin'
}

/**
 * Type guard to check if a string is a valid UserRole
 */
export const isUserRole = (role: string): role is UserRole => {
  return Object.values(UserRole).includes(role as UserRole);
};

/**
 * Interface for permission-based access control
 */
export interface Permission {
  id: string;
  name: string;
  description: string;
}

/**
 * Utility to check if a user has a specific role
 */
export const hasRole = (userRole: string | undefined, requiredRole: UserRole): boolean => {
  if (!userRole) return false;
  
  // Role hierarchy
  switch (requiredRole) {
    case UserRole.USER:
      // Any authenticated user can access USER features
      return true;
    case UserRole.COMPANY_USER:
      // Only company users and above can access COMPANY_USER features
      return [UserRole.COMPANY_USER, UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN].includes(userRole as UserRole);
    case UserRole.COMPANY_ADMIN:
      // Only company admins and super admins can access COMPANY_ADMIN features
      return [UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN].includes(userRole as UserRole);
    case UserRole.SUPER_ADMIN:
      // Only super admins can access SUPER_ADMIN features
      return userRole === UserRole.SUPER_ADMIN;
    default:
      return false;
  }
};
