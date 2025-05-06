
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { profileFormSchema, passwordFormSchema, ProfileFormValues, PasswordFormValues } from '@/domain/schemas/userConfigSchema';

export type ThemeType = 'light' | 'dark' | 'system';
export type LanguageType = 'es' | 'en';

export const useUserConfig = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState<ThemeType>('light');
  const [language, setLanguage] = useState<LanguageType>('es');
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

  // Cambiar configuración de notificaciones
  const handleNotificationsChange = (checked: boolean) => {
    setNotifications(checked);
    toast.success(`Notificaciones ${checked ? 'activadas' : 'desactivadas'}`);
  };

  // Cambiar tema
  const handleThemeChange = (value: string) => {
    setTheme(value as ThemeType);
    toast.success(`Tema cambiado a ${value}`);
  };

  // Cambiar idioma
  const handleLanguageChange = (value: string) => {
    setLanguage(value as LanguageType);
    toast.success(`Idioma cambiado a ${value === 'es' ? 'Español' : 'Inglés'}`);
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
      case 'notifications': return 'Notificaciones';
      case 'appearance': return 'Apariencia';
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
    notifications,
    theme,
    language,
    isDrawerOpen,
    setIsDrawerOpen,
    profileForm,
    passwordForm,
    onProfileSubmit,
    onPasswordSubmit,
    handleNotificationsChange,
    handleThemeChange,
    handleLanguageChange,
    getInitials,
    getActiveTabTitle,
    handleTabChange,
    user
  };
};
