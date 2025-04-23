
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PermissionsTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Permisos del usuario</CardTitle>
        <CardDescription>Gestiona los permisos y accesos del usuario</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Los permisos se asignan automáticamente según el rol del usuario.
        </p>
      </CardContent>
    </Card>
  );
};

export default PermissionsTab;
