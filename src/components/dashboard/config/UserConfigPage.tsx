
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { UserPlus, Lock, Bell, Globe, Palette, Settings2 } from 'lucide-react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from '@/hooks/use-mobile';

// Schema para validación de formulario de perfil
const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  email: z.string().email({ message: 'Introduce un email válido' }),
  profileImage: z.string().optional(),
});

// Schema para validación de formulario de contraseña
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Introduce tu contraseña actual' }),
  newPassword: z.string().min(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' }),
  confirmPassword: z.string().min(8, { message: 'Confirma tu nueva contraseña' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

const UserConfigPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Form para perfil
  const profileForm = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      profileImage: '',
    },
  });

  // Form para contraseña
  const passwordForm = useForm({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Manejar envío de formulario de perfil
  const onProfileSubmit = (data: z.infer<typeof profileFormSchema>) => {
    toast.success('Perfil actualizado correctamente');
    console.log('Profile data:', data);
  };

  // Manejar envío de formulario de contraseña
  const onPasswordSubmit = (data: z.infer<typeof passwordFormSchema>) => {
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
    setTheme(value as 'light' | 'dark' | 'system');
    toast.success(`Tema cambiado a ${value}`);
  };

  // Cambiar idioma
  const handleLanguageChange = (value: string) => {
    setLanguage(value as 'es' | 'en');
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

  // Renderiza el contenido del tab
  const renderTabContent = () => {
    return (
      <>
        {/* Perfil */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de perfil</CardTitle>
              <CardDescription>
                Actualiza tu información personal y foto de perfil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex flex-col items-center space-y-2">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={profileForm.watch('profileImage')} />
                        <AvatarFallback className="text-xl">
                          {getInitials(user?.name || 'Usuario')}
                        </AvatarFallback>
                      </Avatar>
                      <Button variant="outline" size="sm" className="mt-2">
                        Cambiar foto
                      </Button>
                    </div>

                    <div className="flex-1 space-y-4">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <CardFooter className="px-0 pb-0 pt-4">
                    <Button type="submit">Guardar cambios</Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contraseña */}
        <TabsContent value="password" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cambiar contraseña</CardTitle>
              <CardDescription>
                Actualiza tu contraseña para mantener tu cuenta segura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña actual</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nueva contraseña</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar nueva contraseña</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <CardFooter className="px-0 pb-0 pt-4">
                    <Button type="submit">Actualizar contraseña</Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificaciones */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de notificaciones</CardTitle>
              <CardDescription>
                Configura cómo y cuándo recibes notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Notificaciones por email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe emails sobre tus alquileres y actividad
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={handleNotificationsChange}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="marketing">Emails de marketing</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe ofertas y novedades de appquilar
                  </p>
                </div>
                <Switch id="marketing" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Apariencia */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Apariencia</CardTitle>
              <CardDescription>
                Personaliza la apariencia y el idioma de la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Tema</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant={theme === 'light' ? 'default' : 'outline'} 
                    className="justify-start"
                    onClick={() => handleThemeChange('light')}
                  >
                    <Palette className="mr-2 h-4 w-4" />
                    Claro
                  </Button>
                  <Button 
                    variant={theme === 'dark' ? 'default' : 'outline'} 
                    className="justify-start"
                    onClick={() => handleThemeChange('dark')}
                  >
                    <Palette className="mr-2 h-4 w-4" />
                    Oscuro
                  </Button>
                  <Button 
                    variant={theme === 'system' ? 'default' : 'outline'} 
                    className="justify-start"
                    onClick={() => handleThemeChange('system')}
                  >
                    <Palette className="mr-2 h-4 w-4" />
                    Sistema
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Idioma</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={language === 'es' ? 'default' : 'outline'} 
                    className="justify-start"
                    onClick={() => handleLanguageChange('es')}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Español
                  </Button>
                  <Button 
                    variant={language === 'en' ? 'default' : 'outline'} 
                    className="justify-start"
                    onClick={() => handleLanguageChange('en')}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Inglés
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </>
    );
  };

  // Renderizado para escritorio
  const renderDesktopLayout = () => (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid grid-cols-4 md:w-[400px]">
        <TabsTrigger value="profile">Perfil</TabsTrigger>
        <TabsTrigger value="password">Contraseña</TabsTrigger>
        <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        <TabsTrigger value="appearance">Apariencia</TabsTrigger>
      </TabsList>

      {renderTabContent()}
    </Tabs>
  );

  // Renderizado para móvil
  const renderMobileLayout = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{getActiveTabTitle()}</h2>
        
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings2 size={18} />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="px-4">
            <DrawerHeader className="text-left p-4">
              <DrawerTitle>Configuración</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4">
              <div className="flex flex-col space-y-1 w-full">
                <Button 
                  variant={activeTab === 'profile' ? 'default' : 'ghost'}
                  className="justify-start w-full"
                  onClick={() => handleTabChange('profile')}
                >
                  Perfil
                </Button>
                <Button 
                  variant={activeTab === 'password' ? 'default' : 'ghost'}
                  className="justify-start w-full"
                  onClick={() => handleTabChange('password')}
                >
                  Contraseña
                </Button>
                <Button 
                  variant={activeTab === 'notifications' ? 'default' : 'ghost'}
                  className="justify-start w-full"
                  onClick={() => handleTabChange('notifications')}
                >
                  Notificaciones
                </Button>
                <Button 
                  variant={activeTab === 'appearance' ? 'default' : 'ghost'}
                  className="justify-start w-full"
                  onClick={() => handleTabChange('appearance')}
                >
                  Apariencia
                </Button>
              </div>
            </div>
            <DrawerFooter className="pt-0">
              <DrawerClose asChild>
                <Button variant="outline">Cerrar</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
      
      {/* Contenido del tab seleccionado */}
      {renderTabContent()}
    </div>
  );

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-display font-semibold">Configuración</h1>
        <p className="text-muted-foreground">Gestiona tus preferencias y datos personales</p>
      </div>

      {isMobile ? renderMobileLayout() : renderDesktopLayout()}
    </div>
  );
};

export default UserConfigPage;
