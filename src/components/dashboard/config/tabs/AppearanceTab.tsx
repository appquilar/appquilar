
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Palette } from 'lucide-react';
import { ThemeType, LanguageType } from '../hooks/useUserConfig';

interface AppearanceTabProps {
  theme: ThemeType;
  language: LanguageType;
  handleThemeChange: (value: string) => void;
  handleLanguageChange: (value: string) => void;
}

const AppearanceTab: React.FC<AppearanceTabProps> = ({
  theme,
  language,
  handleThemeChange,
  handleLanguageChange
}) => {
  return (
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
  );
};

export default AppearanceTab;
