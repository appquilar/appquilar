
import { Edit, UserMinus, Check, Package } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from '@/domain/models/User.ts';
import { toast } from 'sonner';
import { UserService } from '@/application/services/UserService';
import { useNavigate } from 'react-router-dom';
import RemoveUserConfirmationModal from './RemoveUserConfirmationModal';
import { useState } from 'react';

const statusColors = {
  'active': 'bg-green-100 text-green-800',
  'pending': 'bg-yellow-100 text-yellow-800',
  'invited': 'bg-blue-100 text-blue-800',
  'deactivated': 'bg-red-100 text-red-800',
  'accepted': 'bg-green-100 text-green-800',
  'expired': 'bg-gray-100 text-gray-800'
};

const statusLabels = {
  'active': 'Activo',
  'pending': 'Pendiente',
  'invited': 'Invitado',
  'deactivated': 'Desactivado',
  'accepted': 'Aceptado',
  'expired': 'Expirado'
};

interface CompanyUsersTableProps {
  users: User[];
  onUsersChange: (users: User[]) => void;
}

export const CompanyUsersTable = ({ users, onUsersChange }: CompanyUsersTableProps) => {
  const userService = UserService.getInstance();
  const navigate = useNavigate();
  const [userToRemove, setUserToRemove] = useState<User | null>(null);

  const handleRemoveFromCompany = async (userId: string) => {
    try {
      const success = await userService.removeUserFromCompany(userId);
      if (success) {
        const updatedUsers = users.filter(u => u.id !== userId);
        onUsersChange(updatedUsers);
        toast.success('Usuario removido de la empresa');
      }
    } catch (error) {
      toast.error('Error al remover el usuario de la empresa');
    }
    setUserToRemove(null);
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg">
        <h3 className="text-lg font-medium mb-2">No hay usuarios registrados</h3>
        <p className="text-muted-foreground mb-6">
          Invita a nuevos usuarios para que puedan acceder a la plataforma.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha de alta</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.imageUrl} />
                      <AvatarFallback>{user.name?.charAt(0) || user.email.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name || 'Pendiente'}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.role === 'company_admin' ? 'Administrador' : 'Usuario'}
                </TableCell>
                <TableCell>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${statusColors[user.status]}`}>
                    {statusLabels[user.status]}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(user.dateAdded).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {user.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-green-500"
                        onClick={async () => {
                          try {
                            const updatedUser = await userService.updateUser(user.id, { 
                              status: 'active' as User['status']
                            });
                            const updatedUsers = users.map(u => 
                              u.id === user.id ? updatedUser : u
                            );
                            onUsersChange(updatedUsers);
                            toast.success('Usuario aceptado correctamente');
                          } catch (error) {
                            toast.error('Error al aceptar el usuario');
                          }
                        }}
                      >
                        <Check size={16} />
                        <span className="sr-only">Aceptar</span>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 text-blue-500"
                      onClick={() => navigate(`/dashboard/users/${user.id}/products`)}
                    >
                      <Package size={16} />
                      <span className="sr-only">Ver productos</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => navigate(`/dashboard/users/${user.id}`)}
                    >
                      <Edit size={16} />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => setUserToRemove(user)}
                    >
                      <UserMinus size={16} />
                      <span className="sr-only">Remover de la empresa</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <RemoveUserConfirmationModal
        isOpen={!!userToRemove}
        onClose={() => setUserToRemove(null)}
        onConfirm={() => userToRemove && handleRemoveFromCompany(userToRemove.id)}
        userName={userToRemove?.name || userToRemove?.email || ''}
      />
    </>
  );
};
