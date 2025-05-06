
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings2 } from 'lucide-react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface MobileConfigLayoutProps {
  activeTab: string;
  title: string;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  handleTabChange: (value: string) => void;
  children: React.ReactNode;
}

const MobileConfigLayout: React.FC<MobileConfigLayoutProps> = ({
  activeTab,
  title,
  isDrawerOpen,
  setIsDrawerOpen,
  handleTabChange,
  children
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        
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
      
      {children}
    </div>
  );
};

export default MobileConfigLayout;
