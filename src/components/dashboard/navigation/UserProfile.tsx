
import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/**
 * Componente que muestra información del usuario/empresa en la navegación
 */
const UserProfile = () => {
  const { user, logout } = useAuth();
  const isCompanyUser = user?.role === 'company_admin' || user?.role === 'company_user';

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="p-4 border-t border-border">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium shrink-0">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">
            {user?.name || 'Usuario'}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {isCompanyUser 
              ? `${user?.companyName || 'Empresa'} - ${user?.role === 'company_admin' ? 'Admin' : 'Usuario'}`
              : 'Cuenta Personal'}
          </p>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          title="Cerrar sesión"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
