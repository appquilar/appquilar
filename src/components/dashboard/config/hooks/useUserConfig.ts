
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { 
  profileFormSchema, 
  passwordFormSchema, 
  addressFormSchema,
  ProfileFormValues, 
  PasswordFormValues,
  AddressFormValues 
} from '@/domain/schemas/userConfigSchema';

export const useUserConfig = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form para perfil
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      profileImage: '',
    },
  });

  // Form para contraseña
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Form para dirección
  const addressForm = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      street: '',
      street2: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      latitude: undefined,
      longitude: undefined,
    },
  });

  // Manejar envío de formulario de perfil
  const onProfileSubmit = (data: ProfileFormValues) => {
    toast.success('Perfil actualizado correctamente');
    console.log('Profile data:', data);
  };

  // Manejar envío de formulario de contraseña
  const onPasswordSubmit = (data: PasswordFormValues) => {
    toast.success('Contraseña actualizada correctamente');
    console.log('Password data:', data);
    passwordForm.reset();
  };

  // Manejar envío de formulario de dirección
  const onAddressSubmit = (data: AddressFormValues) => {
    toast.success('Dirección guardada correctamente');
    console.log('Address data:', data);
  };

  // Obtener iniciales para avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Obtener título según el tab activo
  const getActiveTabTitle = () => {
    switch (activeTab) {
      case 'profile': return 'Perfil';
      case 'password': return 'Contraseña';
      case 'address': return 'Dirección';
      default: return 'Perfil';
    }
  };

  // Cambiar tab y cerrar drawer en móvil
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setIsDrawerOpen(false);
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
    onPasswordSubmit,
    onAddressSubmit,
    getInitials,
    getActiveTabTitle,
    handleTabChange,
    user
  };
};
