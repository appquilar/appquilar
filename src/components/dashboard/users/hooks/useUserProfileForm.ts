
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CompanyUser } from '@/domain/models/CompanyUser';
import { useEffect } from 'react';
import { useCompanies } from '@/application/hooks/useCompanies';

// Define schema outside of the hook to avoid recreation on each render
export const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  email: z.string().email({ message: 'El email debe ser válido' }),
  role: z.enum(['company_user', 'company_admin'] as const),
  companyId: z.string().optional(),
  images: z.array(z.any()).optional(),
});

export type UserProfileFormValues = z.infer<typeof profileFormSchema>;

export const useUserProfileForm = (user: CompanyUser | undefined) => {
  const { companies } = useCompanies();

  const profileForm = useForm<UserProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || 'company_user',
      companyId: user?.companyId,
      images: user?.imageUrl ? [
        {
          id: 'profile-image',
          url: user.imageUrl,
          file: null,
          isPrimary: true
        }
      ] : [],
    }
  });

  // Update form values when user data changes
  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        images: user.imageUrl ? [
          {
            id: 'profile-image',
            url: user.imageUrl,
            file: null,
            isPrimary: true
          }
        ] : [],
      });
    }
  }, [user, profileForm]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return {
    profileForm,
    getInitials,
    companies,
  };
};
