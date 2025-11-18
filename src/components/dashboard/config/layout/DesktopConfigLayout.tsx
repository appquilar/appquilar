
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
      <TabsList className="grid grid-cols-3 md:w-[500px]">
        <TabsTrigger value="profile">Perfil</TabsTrigger>
        <TabsTrigger value="password">Contraseña</TabsTrigger>
        <TabsTrigger value="address">Dirección</TabsTrigger>
      </TabsList>

      {children}
    </Tabs>
  );
};

export default DesktopConfigLayout;
