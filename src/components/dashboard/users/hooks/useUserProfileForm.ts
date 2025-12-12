import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { User } from "@/domain/models/User";
import { UserRole } from "@/domain/models/UserRole";
import { useCompanies } from "@/application/hooks/useCompanies";
import type { ImageFile } from "@/components/dashboard/forms/image-upload/types";

/**
 * Schema del formulario
 * - roles: múltiple
 * - images: SOLO UI
 */
export const profileFormSchema = z.object({
    firstName: z
        .string()
        .min(2, { message: "El nombre debe tener al menos 2 caracteres" }),

    lastName: z
        .string()
        .min(2, { message: "El apellido debe tener al menos 2 caracteres" }),

    email: z.string().email({ message: "El email debe ser válido" }),

    roles: z.array(z.nativeEnum(UserRole)).min(1, {
        message: "El usuario debe tener al menos un rol",
    }),

    companyId: z.string().optional(),

    /**
     * SOLO UI
     * El backend trabaja con profilePictureId (string | null)
     */
    images: z.array(z.any()).optional(),
});

export type UserProfileFormValues = z.infer<typeof profileFormSchema>;

export const useUserProfileForm = (user: User | undefined) => {
    const { companies } = useCompanies();

    const profileForm = useForm<UserProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            firstName: user?.firstName ?? "",
            lastName: user?.lastName ?? "",
            email: user?.email ?? "",
            roles: user?.roles ?? [],
            companyId: user?.companyId,
            images: user?.profilePictureId
                ? [
                    {
                        id: "profile-image",
                        url: user.profilePictureId,
                        file: null,
                        isPrimary: true,
                    } satisfies ImageFile,
                ]
                : [],
        },
    });

    /**
     * Reset cuando cambia el usuario
     */
    useEffect(() => {
        if (!user) return;

        profileForm.reset({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            roles: user.roles,
            companyId: user.companyId,
            images: user.profilePictureId
                ? [
                    {
                        id: "profile-image",
                        url: user.profilePictureId,
                        file: null,
                        isPrimary: true,
                    } satisfies ImageFile,
                ]
                : [],
        });
    }, [user, profileForm]);

    const getInitials = (name: string) =>
        name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();

    return {
        profileForm,
        getInitials,
        companies,
    };
};
