
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileFormValues } from '@/domain/schemas/userConfigSchema';
import { UseFormReturn } from 'react-hook-form';
import ProfileImageUpload from '../../users/ProfileImageUpload';
import { ImageFile } from '@/components/dashboard/forms/image-upload/types';

interface ProfileTabProps {
  profileForm: UseFormReturn<ProfileFormValues>;
  onProfileSubmit: (data: ProfileFormValues) => void;
  getInitials: (name: string) => string;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ profileForm, onProfileSubmit, getInitials }) => {
  const { user } = useAuth();
  
  const handleImageChange = (images: ImageFile[]) => {
    profileForm.setValue('profileImage', images.length > 0 ? images[0].url || '' : '', { 
      shouldValidate: true 
    });
  };

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
                <FormField
                  control={profileForm.control}
                  name="profileImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ProfileImageUpload 
                          value={field.value ? [{
                            id: 'profile-image',
                            url: field.value,
                            file: null,
                            isPrimary: true
                          }] : []}
                          onChange={handleImageChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
