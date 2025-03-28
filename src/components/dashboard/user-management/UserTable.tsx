
import { Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CompanyUser } from '@/domain/models/CompanyUser';

interface UserTableProps {
  users: CompanyUser[];
  onEdit: (userId: string) => void;
  onDelete: (userId: string) => void;
}

const UserTable = ({ users, onEdit, onDelete }: UserTableProps) => {
  // Status badge renderer
  const renderStatusBadge = (status: CompanyUser['status']) => {
    return (
      <Badge
        className={`${
          status === 'active' 
            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' 
            : status === 'invited'
              ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
        }`}
      >
        {status === 'active' 
          ? 'Activo' 
          : status === 'invited' 
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(user.id)}
                      disabled={user.id === '1'} // Can't edit the owner
                    >
                      <Edit size={16} />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => onDelete(user.id)}
                      disabled={user.id === '1'} // Can't delete the owner
                    >
                      <Trash size={16} />
                      <span className="sr-only">Eliminar</span>
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
