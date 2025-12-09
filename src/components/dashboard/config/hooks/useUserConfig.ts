import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
    addressFormSchema,
    AddressFormValues,
    passwordFormSchema,
    PasswordFormValues,
    profileFormSchema,
    ProfileFormValues,
} from "@/domain/schemas/userConfigSchema";
import { Uuid } from "@/domain/valueObject/uuidv4";
import { userService, mediaService } from "@/compositionRoot";

export const useUserConfig = () => {
    const {
        currentUser,
        refreshCurrentUser,
        changePassword,
        logout,
    } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("profile");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Leer el tab de los query params al montar
    useEffect(() => {
        const tabParam = searchParams.get("tab");
        if (tabParam && ["profile", "password", "address"].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    // --------------------------------------------------------
    // FORMULARIO DE PERFIL
    // --------------------------------------------------------
    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            firstName: currentUser?.firstName || "",
            lastName: currentUser?.lastName || "",
            email: currentUser?.email || "",
            profilePicture: "",
        },
    });

    useEffect(() => {
        if (currentUser) {
            profileForm.reset({
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                email: currentUser.email,
                profilePicture: "",
            });
        }
    }, [currentUser, profileForm]);

    // --------------------------------------------------------
    // FORMULARIO DE CONTRASEÑA
    // --------------------------------------------------------
    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    // --------------------------------------------------------
    // FORMULARIO DE DIRECCIÓN
    // --------------------------------------------------------
    const addressForm = useForm<AddressFormValues>({
        resolver: zodResolver(addressFormSchema),
        defaultValues: {
            street: currentUser?.address?.street || "",
            street2: currentUser?.address?.street2 || "",
            city: currentUser?.address?.city || "",
            state: currentUser?.address?.state || "",
            country: currentUser?.address?.country || "",
            postalCode: currentUser?.address?.postalCode || "",
            latitude: currentUser?.location?.latitude || undefined,
            longitude: currentUser?.location?.longitude || undefined,
        },
    });

    // --------------------------------------------------------
    // GESTIÓN INMEDIATA DE IMAGEN DE PERFIL - SUBIR
    // --------------------------------------------------------
    const onImageUpload = async (file: File) => {
        if (!currentUser) return;

        const toastId = toast.loading("Actualizando foto de perfil...");

        try {
            // 1. Borrar imagen anterior si existe
            if (currentUser.profilePictureId) {
                try {
                    await mediaService.deleteImage(currentUser.profilePictureId);
                } catch (error) {
                    console.warn(
                        "Failed to delete old image, continuing with upload.",
                        error,
                    );
                }
            }

            // 2. Generar nuevo UUID en el FE
            const newImageId = Uuid.generate().toString();

            // 3. Subir nueva imagen con ese ID
            await mediaService.uploadImage(file, newImageId);

            // 4. Actualizar usuario con el nuevo profilePictureId
            await userService.updateUser(currentUser.id, {
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                email: currentUser.email,
                profilePictureId: newImageId,
            });

            // 5. Refrescar el usuario en el contexto
            if (refreshCurrentUser) {
                await refreshCurrentUser();
            }

            toast.success("Foto de perfil actualizada", { id: toastId });
        } catch (error) {
            console.error("Error updating profile picture:", error);
            toast.error("Error al actualizar la foto", { id: toastId });

            // Revertir UI: vaciamos el campo para que vuelva a usar la URL del servidor
            profileForm.setValue("profilePicture", "");
        }
    };

    // --------------------------------------------------------
    // GESTIÓN DE ELIMINAR IMAGEN (X)
    // --------------------------------------------------------
    const onImageRemove = async () => {
        if (!currentUser || !currentUser.profilePictureId) {
            profileForm.setValue("profilePicture", "");
            return;
        }

        const toastId = toast.loading("Eliminando foto de perfil...");

        try {
            // 1. Borrar imagen en media
            await mediaService.deleteImage(currentUser.profilePictureId);

            // 2. Actualizar usuario para dejar sin imagen
            await userService.updateUser(currentUser.id, {
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                email: currentUser.email,
                profilePictureId: null,
            });

            // 3. Refrescar usuario
            if (refreshCurrentUser) {
                await refreshCurrentUser();
            }

            // 4. Limpiar preview del formulario
            profileForm.setValue("profilePicture", "");

            toast.success("Foto de perfil eliminada", { id: toastId });
        } catch (error) {
            console.error("Error deleting profile picture:", error);
            toast.error("Error al eliminar la foto de perfil", { id: toastId });
        }
    };

    // --------------------------------------------------------
    // SUBMITS DE FORMULARIOS
    // --------------------------------------------------------

    const onProfileSubmit = async (data: ProfileFormValues) => {
        if (!currentUser) return;

        try {
            await userService.updateUser(currentUser.id, {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
            });

            if (refreshCurrentUser) {
                await refreshCurrentUser();
            }

            toast.success("Perfil actualizado correctamente");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Error al guardar los cambios del perfil");
        }
    };

    const onPasswordSubmit = async (data: PasswordFormValues) => {
        try {
            // Zod ya valida que newPassword === confirmPassword
            await changePassword(data.currentPassword, data.newPassword);

            // Reset del formulario
            passwordForm.reset();

            // Logout de la sesión actual
            await logout();

            // Guardamos un mensaje para mostrar en el login del AuthModal
            sessionStorage.setItem(
                "auth:postChangePasswordMessage",
                "Has cambiado tu contraseña, por favor, vuelve a iniciar sesión.",
            );

            // Redirigimos al índice
            navigate("/", { replace: true });
        } catch (error) {
            console.error("Error changing password:", error);
            toast.error(
                "No se ha podido actualizar la contraseña. Revisa los datos e inténtalo de nuevo.",
            );
        }
    };

    const onAddressSubmit = async (data: AddressFormValues) => {
        if (!currentUser) return;
        try {
            await userService.updateUserAddress(currentUser.id, {
                address: {
                    street: data.street,
                    street2: data.street2 || undefined,
                    city: data.city,
                    state: data.state,
                    country: data.country,
                    postalCode: data.postalCode,
                },
                location:
                    data.latitude && data.longitude
                        ? {
                            latitude: data.latitude,
                            longitude: data.longitude,
                        }
                        : undefined,
            });

            if (refreshCurrentUser) {
                await refreshCurrentUser();
            }

            toast.success("Dirección guardada correctamente");
        } catch (error) {
            console.error("Error updating address:", error);
            toast.error("Error al guardar la dirección");
        }
    };

    // --------------------------------------------------------
    // UTILIDADES UI
    // --------------------------------------------------------
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    const getActiveTabTitle = () => {
        switch (activeTab) {
            case "profile":
                return "Perfil";
            case "password":
                return "Contraseña";
            case "address":
                return "Dirección";
            default:
                return "Perfil";
        }
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        setIsDrawerOpen(false);
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set("tab", value);
            return next;
        });
    };

    return {
        activeTab,
        setActiveTab,
        isDrawerOpen,
        setIsDrawerOpen,
        profileForm,
        passwordForm,
        addressForm,
        onProfileSubmit,
        onImageUpload,
        onImageRemove,
        onPasswordSubmit,
        onAddressSubmit,
        getInitials,
        getActiveTabTitle,
        handleTabChange,
        currentUser,
    };
};
