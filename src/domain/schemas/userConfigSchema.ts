
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

// Schema para validación de formulario de dirección
export const addressFormSchema = z.object({
  street: z.string().min(1, { message: 'La calle es requerida' }),
  street2: z.string().optional(),
  city: z.string().min(1, { message: 'La ciudad es requerida' }),
  state: z.string().min(1, { message: 'El estado/provincia es requerido' }),
  country: z.string().min(1, { message: 'El país es requerido' }),
  postalCode: z.string().min(1, { message: 'El código postal es requerido' }),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
export type PasswordFormValues = z.infer<typeof passwordFormSchema>;
export type AddressFormValues = z.infer<typeof addressFormSchema>;
