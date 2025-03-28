
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserManagementHeaderProps {
  onInvite: () => void;
}

const UserManagementHeader = ({ onInvite }: UserManagementHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-display font-semibold">Gestión de Usuarios</h1>
        <p className="text-muted-foreground">Administra los usuarios que tienen acceso a tu cuenta de empresa.</p>
      </div>
      <Button onClick={onInvite} className="gap-2">
        <UserPlus size={16} />
        Invitar Usuario
      </Button>
    </div>
  );
};

export default UserManagementHeader;
