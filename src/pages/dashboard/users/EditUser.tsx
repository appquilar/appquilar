
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUsers } from '@/application/hooks/useUsers';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FormHeader from '@/components/dashboard/common/FormHeader';
import { Button } from '@/components/ui/button';
import { UserProfileForm } from '@/components/dashboard/users/UserProfileForm';

const EditUserPage = () => {
  const { userId } = useParams();
  const { users, handleEditUser, isLoading } = useUsers();
  const navigate = useNavigate();
  
  // Find the user once, without any conditional logic that might affect hook order
  const user = users.find(u => u.id === userId);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-8 max-w-3xl">
        <FormHeader title="Editar Usuario" backUrl="/dashboard/users" />
        <Card>
          <CardContent className="p-6 flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle user not found
  if (!user) {
    return (
      <div className="container mx-auto py-6 space-y-8 max-w-3xl">
        <FormHeader title="Editar Usuario" backUrl="/dashboard/users" />
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <p className="text-lg font-medium text-muted-foreground">Usuario no encontrado</p>
              <Button 
                onClick={() => navigate('/dashboard/users')} 
                className="mt-4"
              >
                Volver a la lista de usuarios
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = async (formData) => {
    try {
      await handleEditUser(user.id, formData);
      toast.success('Usuario actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar el usuario');
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-3xl">
      <FormHeader title="Editar Usuario" backUrl="/dashboard/users" />

      <Card>
        <CardHeader>
          <CardTitle>Información del perfil</CardTitle>
          <CardDescription>Actualiza la información personal del usuario</CardDescription>
        </CardHeader>
        <CardContent>
          <UserProfileForm user={user} onSubmit={onSubmit} />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditUserPage;
