
import { useNavigate, useParams } from 'react-router-dom';
import { useUsers } from '@/application/hooks/useUsers';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FormHeader from '@/components/dashboard/common/FormHeader';
import { useState } from 'react';
import { User, ShieldCheck, Lock } from 'lucide-react';
import ProfileTab from '@/components/dashboard/users/tabs/ProfileTab';
import PermissionsTab from '@/components/dashboard/users/tabs/PermissionsTab';
import SecurityTab from '@/components/dashboard/users/tabs/SecurityTab';

const EditUserPage = () => {
  const { userId } = useParams();
  const { users, handleEditUser } = useUsers();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const user = users.find(u => u.id === userId);

  if (!user) {
    return <div className="p-4">Usuario no encontrado</div>;
  }

  const onProfileSubmit = async (data: { name: string; role: 'company_user' | 'company_admin' }) => {
    setIsSubmitting(true);
    try {
      await handleEditUser(user.id, data);
      toast.success('Usuario actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar el usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-5xl">
      <FormHeader title="Editar Usuario" backUrl="/dashboard/users" />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-[400px]">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <ShieldCheck className="w-4 h-4 mr-2" />
            Permisos
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="w-4 h-4 mr-2" />
            Seguridad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab 
            user={user}
            onSubmit={onProfileSubmit}
            isSubmitting={isSubmitting}
          />
        </TabsContent>

        <TabsContent value="permissions">
          <PermissionsTab />
        </TabsContent>

        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EditUserPage;
