import React from "react";
import type { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import type { AdminUserProfileFormValues } from "@/domain/schemas/adminUserEditSchema";
import { UserRole } from "@/domain/models/UserRole";

import ProfilePictureUpload from "@/components/dashboard/users/ProfilePictureUpload";
import type { ImageFile } from "@/components/dashboard/forms/image-upload/types";
import { useProfilePicture } from "@/components/dashboard/hooks/useProfilePicture";

interface AdminUserProfileTabProps {
    profileForm: UseFormReturn<AdminUserProfileFormValues>;
    userProfilePictureId: string | null | undefined;
    onProfileSubmit: (data: AdminUserProfileFormValues) => void;
    onImageUpload: (file: File) => Promise<void>;
    onImageRemove: () => Promise<void> | void;
}

const AdminUserProfileTab: React.FC<AdminUserProfileTabProps> = ({
                                                                     profileForm,
                                                                     userProfilePictureId,
                                                                     onProfileSubmit,
                                                                     onImageUpload,
                                                                     onImageRemove,
                                                                 }) => {
    // URL segura (blob) desde el servidor
    const { profilePicture: serverProfilePictureUrl } =
        useProfilePicture(userProfilePictureId);

    const handleImageChange = async (images: ImageFile[]) => {
        const imageFile = images.length > 0 ? images[0] : null;

        if (!imageFile) {
            profileForm.setValue("profilePicture", "", { shouldValidate: true });
            await onImageRemove();
            return;
        }

        // Preview inmediato
        profileForm.setValue("profilePicture", imageFile.url || "", {
            shouldValidate: true,
        });

        // Upload inmediato
        if (imageFile.file) {
            await onImageUpload(imageFile.file);
        }
    };

    const formImageUrl = profileForm.watch("profilePicture");
    const displayUrl = formImageUrl || serverProfilePictureUrl;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Información de perfil</CardTitle>
                <CardDescription>
                    Actualiza nombre/apellidos, roles y foto de perfil.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Form {...profileForm}>
                    <form
                        onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                        className="space-y-6"
                    >
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            {/* Imagen */}
                            <div className="flex flex-col items-center space-y-2">
                                <FormField
                                    control={profileForm.control}
                                    name="profilePicture"
                                    render={() => (
                                        <FormItem>
                                            <FormControl>
                                                <ProfilePictureUpload
                                                    value={
                                                        displayUrl
                                                            ? [
                                                                {
                                                                    id: "profile-image",
                                                                    url: displayUrl,
                                                                    file: null,
                                                                    isPrimary: true,
                                                                },
                                                            ]
                                                            : []
                                                    }
                                                    onChange={handleImageChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <p className="text-xs text-muted-foreground text-center max-w-[220px]">
                                    Arrastra una imagen o haz clic para cambiarla.
                                </p>
                            </div>

                            {/* Datos */}
                            <div className="flex-1 space-y-4 w-full">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <FormField
                                        control={profileForm.control}
                                        name="firstName"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>Nombre</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Nombre" />
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
                                                    <Input {...field} placeholder="Apellidos" />
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
                                                <Input
                                                    {...field}
                                                    type="email"
                                                    disabled
                                                    className="bg-muted"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Roles (multi) */}
                                <FormField
                                    control={profileForm.control}
                                    name="roles"
                                    render={({ field }) => {
                                        const roles = Array.isArray(field.value)
                                            ? field.value
                                            : [];

                                        const hasAdmin = roles.includes(UserRole.ADMIN);
                                        const hasUser = roles.includes(UserRole.REGULAR_USER);

                                        const toggleRole = (role: UserRole) => {
                                            let next = roles.includes(role)
                                                ? roles.filter((r) => r !== role)
                                                : [...roles, role];

                                            // Admin => también User
                                            if (
                                                next.includes(UserRole.ADMIN) &&
                                                !next.includes(UserRole.REGULAR_USER)
                                            ) {
                                                next = [...next, UserRole.REGULAR_USER];
                                            }

                                            // No permitir quitar ROLE_USER si Admin está marcado
                                            if (
                                                role === UserRole.REGULAR_USER &&
                                                roles.includes(UserRole.ADMIN)
                                            ) {
                                                next = Array.from(
                                                    new Set([
                                                        ...next,
                                                        UserRole.ADMIN,
                                                        UserRole.REGULAR_USER,
                                                    ])
                                                );
                                            }

                                            field.onChange(Array.from(new Set(next)));
                                        };

                                        return (
                                            <FormItem>
                                                <FormLabel>Roles</FormLabel>

                                                <div className="space-y-3 rounded-md border p-4">
                                                    <div className="flex items-start gap-3">
                                                        <Checkbox
                                                            checked={hasUser}
                                                            onCheckedChange={() =>
                                                                toggleRole(UserRole.REGULAR_USER)
                                                            }
                                                        />
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-medium">
                                                                Usuario
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Permisos estándar.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-3">
                                                        <Checkbox
                                                            checked={hasAdmin}
                                                            onCheckedChange={() =>
                                                                toggleRole(UserRole.ADMIN)
                                                            }
                                                        />
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-medium">
                                                                Administrador
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Un administrador también es usuario.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <FormMessage />
                                            </FormItem>
                                        );
                                    }}
                                />
                            </div>
                        </div>

                        <CardFooter className="px-0 pb-0 pt-4 border-t mt-4">
                            <Button
                                type="submit"
                                disabled={profileForm.formState.isSubmitting}
                            >
                                {profileForm.formState.isSubmitting
                                    ? "Guardando..."
                                    : "Guardar cambios"}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default AdminUserProfileTab;
