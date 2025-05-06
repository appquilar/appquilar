
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DesktopConfigLayoutProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  children: React.ReactNode;
}

const DesktopConfigLayout: React.FC<DesktopConfigLayoutProps> = ({
  activeTab,
  setActiveTab,
  children
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid grid-cols-4 md:w-[400px]">
        <TabsTrigger value="profile">Perfil</TabsTrigger>
        <TabsTrigger value="password">Contraseña</TabsTrigger>
        <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        <TabsTrigger value="appearance">Apariencia</TabsTrigger>
      </TabsList>

      {children}
    </Tabs>
  );
};

export default DesktopConfigLayout;
