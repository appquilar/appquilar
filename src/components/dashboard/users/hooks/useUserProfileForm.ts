
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CompanyUser } from '@/domain/models/CompanyUser';
import { useEffect } from 'react';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  role: z.enum(['company_user', 'company_admin'] as const),
});

export const useUserProfileForm = (user: CompanyUser) => {
  const profileForm = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || '',
      role: user?.role || 'company_user',
    }
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name,
        role: user.role,
      });
    }
  }, [user]);

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
  };
};
