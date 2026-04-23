import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Mail, User } from 'lucide-react';
import { Rental } from '@/domain/models/Rental';

interface CustomerInfoCardProps {
  rental: Rental;
}

const CustomerInfoCard = ({ rental }: CustomerInfoCardProps) => {
  return (
    <Card>
      <CardHeader className="space-y-2 p-5 pb-4 sm:p-6 sm:pb-4">
        <CardTitle className="text-lg font-semibold">Participantes</CardTitle>
        <CardDescription>
          Datos del cliente y de la tienda responsable del alquiler.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
        <div className="space-y-3">
          <div className="rounded-2xl border bg-muted/30 px-4 py-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-background p-2 text-muted-foreground shadow-sm">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Arrendatario</p>
                <p className="mt-1 text-sm font-semibold break-all">{rental.renterName ?? 'Sin asignar'}</p>
                {rental.renterEmail && (
                  <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground break-all">
                    <Mail className="h-3.5 w-3.5" />
                    {rental.renterEmail}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-muted/30 px-4 py-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-background p-2 text-muted-foreground shadow-sm">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tienda</p>
                <p className="mt-1 text-sm font-semibold break-all">{rental.ownerName ?? 'Sin propietario'}</p>
                {rental.ownerLocation?.label && (
                  <p className="mt-1 text-sm text-muted-foreground">Ubicacion: {rental.ownerLocation.label}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerInfoCard;
