import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileFormValues } from '@/domain/schemas/userConfigSchema';
import { UseFormReturn } from 'react-hook-form';
import ProfileImageUpload from '../../users/ProfileImageUpload';
import { ImageFile } from '@/components/dashboard/forms/image-upload/types';
import { useProfileAvatar } from '@/components/dashboard/hooks/useProfileAvatar';
import { useAuth } from '@/context/AuthContext';

interface ProfileTabProps {
    profileForm: UseFormReturn<ProfileFormValues>;
    onProfileSubmit: (data: ProfileFormValues) => void;
    onImageUpload: (file: File) => Promise<void>;
    getInitials: (name: string) => string;
}

const ProfileTab: React.FC<ProfileTabProps> = ({
                                                   profileForm,
                                                   onProfileSubmit,
                                                   onImageUpload
                                               }) => {
    const { user } = useAuth();

    // Obtenemos la URL "segura" (blob) del servidor usando el ID
    const { avatarUrl: serverAvatarUrl } = useProfileAvatar(user?.profileImageId);

    const handleImageChange = async (images: ImageFile[]) => {
        const imageFile = images.length > 0 ? images[0] : null;

        // Actualización visual inmediata en el formulario (con la URL del objeto local del input file)
        profileForm.setValue('profileImage', imageFile?.url || '', {
            shouldValidate: true
        });

        // Disparar la subida al Backend inmediatamente
        if (imageFile?.file) {
            await onImageUpload(imageFile.file);
        }
    };

    // La URL que vigila el formulario. Puede ser la URL de una nueva subida (local)
    // o string vacío si no se ha subido nada nuevo en esta sesión del form.
    const formImageUrl = profileForm.watch('profileImage');

    // Decidimos qué mostrar:
    // 1. Si hay una imagen en el form (recién subida/seleccionada), la mostramos.
    // 2. Si no, mostramos la que viene del servidor (blob).
    const displayUrl = formImageUrl || serverAvatarUrl;

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

                            {/* Sección de la Imagen */}
                            <div className="flex flex-col items-center space-y-2">
                                <FormField
                                    control={profileForm.control}
                                    name="profileImage"
                                    render={() => (
                                        <FormItem>
                                            <FormControl>
                                                <ProfileImageUpload
                                                    value={displayUrl ? [{
                                                        id: 'profile-image',
                                                        url: displayUrl,
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
                                <p className="text-xs text-muted-foreground text-center max-w-[200px]">
                                    Arrastra una imagen o haz clic para cambiarla.
                                </p>
                            </div>

                            {/* Sección de los Datos */}
                            <div className="flex-1 space-y-4 w-full">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <FormField
                                        control={profileForm.control}
                                        name="firstName"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>Nombre</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Tu nombre" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={profileForm.control}
                                        name="lastName"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>Apellidos</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Tus apellidos" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={profileForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="email" disabled className="bg-muted" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <CardFooter className="px-0 pb-0 pt-4 border-t mt-4">
                            <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                                {profileForm.formState.isSubmitting ? 'Guardando...' : 'Guardar información'}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default ProfileTab;