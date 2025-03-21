
import { useAuth } from '@/context/AuthContext';

/**
 * Componente que muestra información del usuario/empresa en la navegación
 */
const UserProfile = () => {
  const { user } = useAuth();
  const isCompanyUser = user?.role === 'company_admin' || user?.role === 'company_user';

  return (
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
  );
};

export default UserProfile;
