
import React from 'react';
import { Tabs } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MobileConfigLayoutProps {
  activeTab: string;
  title: string;
  handleTabChange: (value: string) => void;
  children: React.ReactNode;
}

const MobileConfigLayout: React.FC<MobileConfigLayoutProps> = ({
  activeTab,
  handleTabChange,
  children
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <div className="w-full">
          <Select value={activeTab} onValueChange={handleTabChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sección" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="profile">Perfil</SelectItem>
              <SelectItem value="password">Contraseña</SelectItem>
              <SelectItem value="notifications">Notificaciones</SelectItem>
              <SelectItem value="appearance">Apariencia</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs value={activeTab} className="space-y-4">
        {children}
      </Tabs>
    </div>
  );
};

export default MobileConfigLayout;
