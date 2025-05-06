
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { Tabs } from '@/components/ui/tabs';

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
  isDrawerOpen,
  setIsDrawerOpen,
  handleTabChange,
  children
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Configuración</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-2">
              <Button 
                variant={activeTab === "profile" ? "default" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => handleTabChange("profile")}
              >
                Perfil
              </Button>
              <Button 
                variant={activeTab === "password" ? "default" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => handleTabChange("password")}
              >
                Contraseña
              </Button>
              <Button 
                variant={activeTab === "notifications" ? "default" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => handleTabChange("notifications")}
              >
                Notificaciones
              </Button>
              <Button 
                variant={activeTab === "appearance" ? "default" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => handleTabChange("appearance")}
              >
                Apariencia
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Wrap content in Tabs component with the correct value */}
      <Tabs value={activeTab} className="space-y-4">
        {children}
      </Tabs>
    </div>
  );
};

export default MobileConfigLayout;
