
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileFormValues } from '@/domain/schemas/userConfigSchema';
import { UseFormReturn } from 'react-hook-form';

interface ProfileTabProps {
  profileForm: UseFormReturn<ProfileFormValues>;
  onProfileSubmit: (data: ProfileFormValues) => void;
  getInitials: (name: string) => string;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ profileForm, onProfileSubmit, getInitials }) => {
  const { user } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de perfil</CardTitle>
        <CardDescription>
          Actualiza tu información personal y foto de perfil
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...profileForm}>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex flex-col items-center space-y-2">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profileForm.watch('profileImage')} />
                  <AvatarFallback className="text-xl">
                    {getInitials(user?.name || 'Usuario')}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" className="mt-2">
                  Cambiar foto
                </Button>
              </div>

              <div className="flex-1 space-y-4">
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <CardFooter className="px-0 pb-0 pt-4">
              <Button type="submit">Guardar cambios</Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProfileTab;
