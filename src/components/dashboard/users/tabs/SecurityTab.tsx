
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SecurityTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Seguridad</CardTitle>
        <CardDescription>Opciones de seguridad de la cuenta</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          La gestión de contraseñas se realiza a través del sistema de autenticación.
        </p>
      </CardContent>
    </Card>
  );
};

export default SecurityTab;
