
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit, Mail, Check } from 'lucide-react';
import { toast } from 'sonner';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import FormHeader from '../common/FormHeader';
import { useForm } from 'react-hook-form';
import { Company } from '@/domain/models/Company';
import { CompanyUser, UserInvitationFormData } from '@/domain/models/CompanyUser';
import { MOCK_COMPANIES } from './data/mockCompanies';
import { UserService } from '@/application/services/UserService';

const statusColors = {
  'active': 'bg-green-100 text-green-800',
  'pending': 'bg-yellow-100 text-yellow-800',
  'invited': 'bg-blue-100 text-blue-800',
  'deactivated': 'bg-red-100 text-red-800'
};

const statusLabels = {
  'active': 'Activo',
  'pending': 'Pendiente',
  'invited': 'Invitado',
  'deactivated': 'Desactivado'
};

const CompanyUsersPage = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const userService = UserService.getInstance();

  const inviteForm = useForm<UserInvitationFormData>({
    defaultValues: {
      email: '',
      role: 'company_user',
      companyId: companyId || ''
    }
  });

  useEffect(() => {
    if (!companyId) {
      navigate('/dashboard/companies');
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        const foundCompany = MOCK_COMPANIES.find(c => c.id === companyId);
        if (!foundCompany) {
          navigate('/dashboard/companies');
          return;
        }
        setCompany(foundCompany);
        
        const companyUsers = await userService.getUsersByCompanyId(companyId);
        setUsers(companyUsers);
      } catch (error) {
        console.error('Error loading company users:', error);
        toast.error('Error al cargar los usuarios');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [companyId, navigate]);

  const handleSendInvite = async (data: UserInvitationFormData) => {
    try {
      const newUser = await userService.createUser({
        ...data,
        status: 'invited',
        dateAdded: new Date().toISOString(),
      });
      
      setUsers(prev => [...prev, newUser]);
      setInviteDialogOpen(false);
      inviteForm.reset();
      toast.success('Invitación enviada correctamente');
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Error al enviar la invitación');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <FormHeader
        title={`Gestión de Usuarios - ${company?.name}`}
        backUrl="/dashboard/companies"
      />
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Usuarios de la empresa</h2>
        <Button onClick={() => setInviteDialogOpen(true)} className="gap-2">
          <Mail size={16} />
          Invitar Usuario
        </Button>
      </div>
      
      {users.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <h3 className="text-lg font-medium mb-2">No hay usuarios registrados</h3>
          <p className="text-muted-foreground mb-6">
            Invita a nuevos usuarios para que puedan acceder a la plataforma.
          </p>
          <Button onClick={() => setInviteDialogOpen(true)} className="gap-2">
            <Mail size={16} />
            Invitar Usuario
          </Button>
        </div>
      ) : (
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
                    {new Date(user.dateAdded).toLocaleDateString('es-ES')}
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
                              await userService.updateUser(user.id, { status: 'active' });
                              setUsers(users.map(u => 
                                u.id === user.id ? {...u, status: 'active'} : u
                              ));
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
                        className="h-8 w-8 p-0"
                      >
                        <Edit size={16} />
                        <span className="sr-only">Editar</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Diálogo de invitación */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitar Nuevo Usuario</DialogTitle>
          </DialogHeader>
          
          <Form {...inviteForm}>
            <form onSubmit={inviteForm.handleSubmit(handleSendInvite)} className="space-y-4">
              <FormField
                control={inviteForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="usuario@ejemplo.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={inviteForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="company_admin">Administrador</SelectItem>
                        <SelectItem value="company_user">Usuario</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Enviar Invitación</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyUsersPage;

