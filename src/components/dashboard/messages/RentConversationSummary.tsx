import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { RentConversation } from '@/domain/models/RentConversation';
import { RentalStatusService } from '@/domain/services/RentalStatusService';
import { useUpdateRentStatusFromMessages } from '@/application/hooks/useRentalMessages';
import { useState } from 'react';

interface RentConversationSummaryProps {
  conversation: RentConversation;
}

const formatMoney = (amount: number, currency: string): string => {
  const value = amount / 100;
  return `${value.toFixed(2)} ${currency}`;
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const RentConversationSummary = ({ conversation }: RentConversationSummaryProps) => {
  const rental = conversation.rental;
  const publicProductHref = `/product/${rental.productSlug ?? rental.productId}`;
  const estimatedTotal = rental.price.amount + rental.deposit.amount;
  const ownerName = rental.ownerName ?? 'Sin nombre';
  const ownerAddress = rental.ownerLocation?.label ?? 'Direccion no disponible';
  const updateStatusMutation = useUpdateRentStatusFromMessages(conversation.rentId);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const canCancel = rental.status !== 'cancelled' && rental.status !== 'rental_completed';

  const handleCancelRent = async () => {
    setCancelError(null);

    try {
      await updateStatusMutation.mutateAsync({
        status: 'cancelled',
      });
    } catch (_error) {
      setCancelError('No se pudo cancelar el alquiler. Intentalo de nuevo.');
    }
  };

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">Resumen del alquiler</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 space-y-3 overflow-y-auto text-sm">
        <div>
          <p className="text-muted-foreground">Producto</p>
          <p className="font-medium">{conversation.productName}</p>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <div className="rounded-md border border-border bg-background px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Inicio</p>
            <p className="font-semibold text-foreground">{formatDate(rental.startDate)}</p>
          </div>
          <div className="rounded-md border border-border bg-background px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Fin</p>
            <p className="font-semibold text-foreground">{formatDate(rental.endDate)}</p>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground">Estado</p>
          <Badge className={RentalStatusService.getStatusBadgeClasses(rental.status)}>
            {RentalStatusService.getStatusLabel(rental.status)}
          </Badge>
        </div>

        <div>
          <p className="text-muted-foreground mb-1">Precio (desglosado)</p>
          <div className="rounded-md border border-border bg-background">
            <div className="flex items-center justify-between px-3 py-2 text-sm">
              <span className="text-muted-foreground">Alquiler</span>
              <span className="font-medium">{formatMoney(rental.price.amount, rental.price.currency)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border px-3 py-2 text-sm">
              <span className="text-muted-foreground">Fianza</span>
              <span className="font-medium">{formatMoney(rental.deposit.amount, rental.deposit.currency)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border px-3 py-2 text-sm">
              <span className="font-semibold">Total estimado</span>
              <span className="font-semibold">{formatMoney(estimatedTotal, rental.price.currency)}</span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground">Propietario</p>
          <p className="font-medium">{ownerName}</p>
          <p className="text-sm text-muted-foreground">{ownerAddress}</p>
        </div>

        <div className="space-y-2 pt-1">
          {conversation.role === 'renter' ? (
            <Button asChild variant="outline" className="w-full">
              <a href={publicProductHref} target="_blank" rel="noopener noreferrer">
                Ver producto publico
              </a>
            </Button>
          ) : (
            <Button asChild variant="outline" className="w-full">
              <Link to={`/dashboard/rentals/${conversation.rentId}`}>
                Ir al alquiler
              </Link>
            </Button>
          )}

          {canCancel && (
            <div className="rounded-md border border-border bg-muted/30 p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Acciones</p>
              <Button
                type="button"
                variant="outline"
                className="w-full border-border bg-background text-foreground hover:bg-muted"
                onClick={handleCancelRent}
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? 'Cancelando...' : 'Cancelar alquiler'}
              </Button>
            </div>
          )}

          {cancelError && (
            <p className="text-xs text-destructive">{cancelError}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RentConversationSummary;
