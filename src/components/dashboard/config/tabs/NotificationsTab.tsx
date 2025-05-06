
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface NotificationsTabProps {
  notifications: boolean;
  handleNotificationsChange: (checked: boolean) => void;
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({ 
  notifications, 
  handleNotificationsChange 
}) => {
  return (
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
  );
};

export default NotificationsTab;
