
import { useNavigate, useParams } from 'react-router-dom';
import { useUsers } from '@/application/hooks/useUsers';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FormHeader from '@/components/dashboard/common/FormHeader';
import FormActions from '@/components/dashboard/common/FormActions';
import { useState, useEffect } from 'react';
import { CompanyUser } from '@/domain/models/CompanyUser';

const EditUserPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { users, handleEditUser } = useUsers();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const user = users.find(u => u.id === userId);
  const [name, setName] = useState('');
  const [role, setRole] = useState<CompanyUser['role']>('company_user');
  
  useEffect(() => {
    if (user) {
      setName(user.name);
      setRole(user.role);
    }
  }, [user]);

  if (!user) {
    return <div className="p-4">Usuario no encontrado</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await handleEditUser(user.id, { name, role });
      toast.success('Usuario actualizado correctamente');
      navigate('/dashboard/users');
    } catch (error) {
      toast.error('Error al actualizar el usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = (value: string) => {
    if (value === 'company_user' || value === 'company_admin') {
      setRole(value);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <FormHeader title="Editar Usuario" backUrl="/dashboard/users" />
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nombre</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del usuario"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Rol</label>
            <Select value={role} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="company_user">Usuario</SelectItem>
                <SelectItem value="company_admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <FormActions 
          isSubmitting={isSubmitting}
          onCancel={() => navigate('/dashboard/users')}
        />
      </form>
    </div>
  );
};

export default EditUserPage;
