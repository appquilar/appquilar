import { z } from "zod";

import { profileFormSchema } from "@/domain/schemas/userConfigSchema";
import { UserRole } from "@/domain/models/UserRole";

export const adminUserProfileFormSchema = profileFormSchema.extend({
    roles: z
        .array(z.nativeEnum(UserRole))
        .min(1, { message: "Selecciona al menos un rol" }),
});

export type AdminUserProfileFormValues = z.infer<typeof adminUserProfileFormSchema>;
