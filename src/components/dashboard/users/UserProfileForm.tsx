
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useUserProfileForm } from './hooks/useUserProfileForm';
import { User } from '@/domain/models/User.ts';
import ProfilePictureUpload from './ProfilePictureUpload.tsx';
import { useIsMobile } from '@/hooks/use-mobile';

export const UserProfileForm = ({ 
  user, 
  onSubmit 
}: { 
  user: User;
  onSubmit: (data: any) => Promise<void>; 
}) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profileForm, companies } = useUserProfileForm(user);
  const isMobile = useIsMobile();

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const imageUrl = user.profilePictureId;
      await onSubmit({
        ...data,
        imageUrl,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...profileForm}>
      <form onSubmit={profileForm.handleSubmit(handleSubmit)} className="space-y-4 md:space-y-6">
        <FormField
          control={profileForm.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-center block">Imagen de perfil</FormLabel>
              <div className="flex justify-center">
                <ProfilePictureUpload
                  value={field.value}
                  onChange={field.onChange}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-3 md:gap-4">
          <FormField
            control={profileForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nombre del usuario" className="h-11 md:h-10" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={profileForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="Email del usuario" className="h-11 md:h-10" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={profileForm.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11 md:h-10">
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="company_user">Usuario</SelectItem>
                    <SelectItem value="company_admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {!user.companyId && (
            <FormField
              control={profileForm.control}
              name="companyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 md:h-10">
                        <SelectValue placeholder="Selecciona una empresa" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className={`flex ${isMobile ? 'flex-col' : 'justify-end'} gap-3 mt-6`}>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/dashboard/users')}
            disabled={isSubmitting}
            className={`h-11 md:h-10 ${isMobile ? 'w-full' : ''}`}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className={`h-11 md:h-10 ${isMobile ? 'w-full' : ''}`}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
