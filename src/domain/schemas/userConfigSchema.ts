
import { z } from 'zod';

// Schema para validación de formulario de perfil
export const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  email: z.string().email({ message: 'Introduce un email válido' }),
  profileImage: z.string().optional(),
});

// Schema para validación de formulario de contraseña
export const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Introduce tu contraseña actual' }),
  newPassword: z.string().min(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' }),
  confirmPassword: z.string().min(8, { message: 'Confirma tu nueva contraseña' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
export type PasswordFormValues = z.infer<typeof passwordFormSchema>;
