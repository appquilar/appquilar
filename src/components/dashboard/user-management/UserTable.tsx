
import { Edit, Package2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CompanyUser } from '@/domain/models/CompanyUser';

interface UserTableProps {
  users: CompanyUser[];
  onEdit: (userId: string) => void;
  onDelete?: (userId: string) => Promise<boolean>;
  onViewProducts?: (userId: string) => void;
}

const UserTable = ({ users, onEdit, onDelete, onViewProducts }: UserTableProps) => {
  // Status badge renderer
  const renderStatusBadge = (status: CompanyUser['status']) => {
    return (
      <Badge
        className={`${
          status === 'active' || status === 'accepted'
            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' 
            : status === 'invited' || status === 'pending'
              ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
        }`}
      >
        {status === 'active' || status === 'accepted'
          ? 'Activo' 
          : status === 'invited' || status === 'pending'
            ? 'Invitado' 
            : 'Desactivado'
        }
      </Badge>
    );
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha de alta</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.role === 'company_admin' ? 'Administrador' : 'Usuario'}
                </TableCell>
                <TableCell>
                  {renderStatusBadge(user.status)}
                </TableCell>
                <TableCell>{user.dateAdded}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {onViewProducts && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onViewProducts(user.id)}
                        title="Ver productos"
                      >
                        <Package2 size={16} />
                        <span className="sr-only">Ver productos</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(user.id)}
                      disabled={user.id === '1'} // Can't edit the owner
                      title="Editar usuario"
                    >
                      <Edit size={16} />
                      <span className="sr-only">Editar</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <p className="text-muted-foreground">No se encontraron usuarios</p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
