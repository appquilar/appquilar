import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { compositionRoot, queryClient } from "@/compositionRoot";
import { UserRole } from "@/domain/models/UserRole";
import {
    addressFormSchema,
    type AddressFormValues,
} from "@/domain/schemas/userConfigSchema";
import {
    adminUserProfileFormSchema,
    type AdminUserProfileFormValues,
} from "@/domain/schemas/adminUserEditSchema";

import { useUserById } from "@/application/hooks/useUserById";
import { useAuth } from "@/context/AuthContext";

const userService = compositionRoot.userService;
const mediaService = compositionRoot.mediaService;

function normalizeRoles(input: UserRole[] | undefined): UserRole[] {
    const roles = Array.isArray(input) ? [...input] : [];

    // Regla de negocio pedida: Admin implica Regular User
    if (roles.includes(UserRole.ADMIN) && !roles.includes(UserRole.REGULAR_USER)) {
        roles.push(UserRole.REGULAR_USER);
    }

    return Array.from(new Set(roles));
}

/**
 * Hook de aplicación para la pantalla "Editar usuario" (admin).
 *
 * - Tab Perfil: PATCH /api/users/{id}
 * - Tab Dirección: PATCH /api/users/{id}/address
 * - Gestión de imagen: upload + (opcional) delete antigua + patch del user
 */
export function useAdminUserEditor(userId: string | undefined) {
    const { user, isLoading, error } = useUserById(userId);
    const { currentUser, refreshCurrentUser } = useAuth();

    // -------------------------------
    // Form Perfil (incluye roles)
    // -------------------------------
    const profileForm = useForm<AdminUserProfileFormValues>({
        resolver: zodResolver(adminUserProfileFormSchema),
        defaultValues: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            email: user?.email || "",
            profilePicture: "",
            roles: normalizeRoles(user?.roles as UserRole[] | undefined),
        },
    });

    useEffect(() => {
        if (!user) return;
        profileForm.reset({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            profilePicture: "",
            roles: normalizeRoles(user.roles as UserRole[] | undefined),
        });
    }, [user, profileForm]);

    // -------------------------------
    // Form Dirección
    // -------------------------------
    const addressForm = useForm<AddressFormValues>({
        resolver: zodResolver(addressFormSchema),
        defaultValues: {
            street: user?.address?.street || "",
            street2: user?.address?.street2 || "",
            city: user?.address?.city || "",
            state: user?.address?.state || "",
            country: user?.address?.country || "",
            postalCode: user?.address?.postalCode || "",
            latitude: user?.location?.latitude || undefined,
            longitude: user?.location?.longitude || undefined,
        },
    });

    useEffect(() => {
        if (!user) return;
        addressForm.reset({
            street: user.address?.street || "",
            street2: user.address?.street2 || "",
            city: user.address?.city || "",
            state: user.address?.state || "",
            country: user.address?.country || "",
            postalCode: user.address?.postalCode || "",
            latitude: user.location?.latitude || undefined,
            longitude: user.location?.longitude || undefined,
        });
    }, [user, addressForm]);

    const invalidateUser = async () => {
        if (!userId) return;
        await queryClient.invalidateQueries({ queryKey: ["userById", userId] });
    };

    const refreshCurrentUserIfEditingSelf = async () => {
        if (!userId || currentUser?.id !== userId) {
            return;
        }

        await refreshCurrentUser();
    };

    // -------------------------------
    // Imagen: subir
    // -------------------------------
    const onImageUpload = async (file: File) => {
        if (!userId || !user) return;

        const toastId = toast.loading("Actualizando foto de perfil…");

        try {
            const previousImageId = user.profilePictureId ?? null;
            const newImageId = await mediaService.uploadImage(file);

            await userService.updateUser(userId, {
                profilePictureId: newImageId,
            });

            if (previousImageId) {
                try {
                    await mediaService.deleteImage(previousImageId);
                } catch (e) {
                    console.warn("No se pudo borrar la imagen antigua tras desvincularla.", e);
                }
            }

            await invalidateUser();
            await refreshCurrentUserIfEditingSelf();

            toast.success("Foto de perfil actualizada", { id: toastId });
        } catch (e) {
            console.error(e);
            toast.error("Error al actualizar la foto", { id: toastId });
            profileForm.setValue("profilePicture", "");
        }
    };

    // -------------------------------
    // Imagen: eliminar
    // -------------------------------
    const onImageRemove = async () => {
        if (!userId || !user) {
            profileForm.setValue("profilePicture", "");
            return;
        }

        if (!user.profilePictureId) {
            profileForm.setValue("profilePicture", "");
            return;
        }

        const toastId = toast.loading("Eliminando foto de perfil…");

        try {
            const previousImageId = user.profilePictureId;

            await userService.updateUser(userId, {
                profilePictureId: null,
            });

            try {
                await mediaService.deleteImage(previousImageId);
            } catch (e) {
                console.warn("No se pudo borrar la imagen ya desvinculada.", e);
            }

            await invalidateUser();
            await refreshCurrentUserIfEditingSelf();

            profileForm.setValue("profilePicture", "");
            toast.success("Foto de perfil eliminada", { id: toastId });
        } catch (e) {
            console.error(e);
            toast.error("Error al eliminar la foto", { id: toastId });
        }
    };

    // -------------------------------
    // Submit Perfil
    // -------------------------------
    const onProfileSubmit = async (data: AdminUserProfileFormValues) => {
        if (!userId || !user) return;

        try {
            const roles = normalizeRoles(data.roles);

            await userService.updateUser(userId, {
                firstName: data.firstName,
                lastName: data.lastName,
                // email lo dejamos tal cual (input disabled)
                email: user.email,
                roles,
                // NO tocamos profilePictureId aquí, se gestiona por upload/remove
                profilePictureId: user.profilePictureId ?? null,
            });

            await invalidateUser();
            await refreshCurrentUserIfEditingSelf();

            toast.success("Perfil actualizado correctamente");
        } catch (e) {
            console.error(e);
            toast.error("Error al guardar los cambios del perfil");
        }
    };

    // -------------------------------
    // Submit Dirección
    // -------------------------------
    const onAddressSubmit = async (data: AddressFormValues) => {
        if (!userId) return;

        try {
            await userService.updateUserAddress(userId, {
                address: {
                    street: data.street,
                    street2: data.street2 || undefined,
                    city: data.city,
                    state: data.state,
                    country: data.country,
                    postalCode: data.postalCode,
                },
                location:
                    typeof data.latitude === "number" && typeof data.longitude === "number"
                        ? { latitude: data.latitude, longitude: data.longitude }
                        : undefined,
            });

            await invalidateUser();
            await refreshCurrentUserIfEditingSelf();

            toast.success("Dirección guardada correctamente");
        } catch (e) {
            console.error(e);
            toast.error("Error al guardar la dirección");
        }
    };

    return {
        user,
        isLoading,
        error,
        profileForm,
        addressForm,
        onProfileSubmit,
        onAddressSubmit,
        onImageUpload,
        onImageRemove,
    };
}
