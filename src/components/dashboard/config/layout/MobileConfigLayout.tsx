
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown } from 'lucide-react';

interface MobileConfigLayoutProps {
  activeTab: string;
  title: string;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (value: boolean) => void;
  handleTabChange: (value: string) => void;
  children: React.ReactNode;
}

const MobileConfigLayout: React.FC<MobileConfigLayoutProps> = ({
  activeTab,
  title,
  handleTabChange,
  children
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Select value={activeTab} onValueChange={handleTabChange}>
          <SelectTrigger className="w-[140px]">
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
      
      <Tabs value={activeTab} className="space-y-4">
        {children}
      </Tabs>
    </div>
  );
};

export default MobileConfigLayout;
