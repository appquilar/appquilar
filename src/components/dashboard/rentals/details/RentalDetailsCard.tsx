import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, Tag, Wallet } from 'lucide-react';
import { Rental } from '@/domain/models/Rental';
import { RentActorRole } from '@/domain/services/RentalStateMachineService';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';

interface RentalDetailsCardProps {
  rental: Rental;
  viewerRole: RentActorRole;
  durationDays: number;
  formattedStartDate: string;
  formattedEndDate: string;
}

const formatMoneyFromCents = (amount: number, currency: string): string => {
  const value = amount / 100;
  return `${value.toFixed(2)} ${currency}`;
};

const RentalDetailsCard = ({
  rental,
  viewerRole,
  durationDays,
  formattedStartDate,
  formattedEndDate
}: RentalDetailsCardProps) => {
  const isMobile = useIsMobile();
  const publicProductHref = `/product/${rental.productSlug ?? rental.productId}`;
  const ownerEditProductHref = `/dashboard/products/${rental.productId}`;
  const canOwnerEditProduct = viewerRole === 'owner' || viewerRole === 'admin';
  const shouldShowRenterPublicButton = viewerRole === 'renter';

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div className="min-w-0">
            <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-semibold line-clamp-1`}>
              {canOwnerEditProduct ? (
                <Link to={ownerEditProductHref} className="hover:underline">
                  {rental.productName || 'Producto sin nombre'}
                </Link>
              ) : (
                rental.productName || 'Producto sin nombre'
              )}
            </h2>
            {rental.productInternalId && (
              <p className="text-muted-foreground text-sm">
                <span className="inline-flex items-center mr-2">
                  <Tag className="h-3 w-3 mr-1" />
                  Ref. {rental.productInternalId}
                </span>
              </p>
            )}
          </div>
          {shouldShowRenterPublicButton && (
            <Button asChild variant="outline" size="sm" className="mt-3 md:mt-0">
              <a href={publicProductHref} target="_blank" rel="noopener noreferrer">
                Ver producto publico
              </a>
            </Button>
          )}
        </div>

        <Separator className="my-3" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Detalles del Alquiler</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Calendar className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Período de alquiler</p>
                  <p className="text-sm text-muted-foreground">
                    {formattedStartDate} - {formattedEndDate}
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <Clock className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Duración</p>
                  <p className="text-sm text-muted-foreground">{durationDays} días</p>
                </div>
              </li>
              <li className="flex items-start">
                <Wallet className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Precio</p>
                  <p className="text-sm text-muted-foreground">
                    {formatMoneyFromCents(rental.price.amount, rental.price.currency)}
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <Tag className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Tipo</p>
                  <p className="text-sm text-muted-foreground">{rental.isLead ? 'Lead' : 'Alquiler'}</p>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Fianza y devolución</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <Wallet className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Fianza</p>
                  <p className="text-sm text-muted-foreground">
                    {formatMoneyFromCents(rental.deposit.amount, rental.deposit.currency)}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Wallet className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Fianza devuelta</p>
                  <p className="text-sm text-muted-foreground">
                    {rental.depositReturned
                      ? formatMoneyFromCents(rental.depositReturned.amount, rental.depositReturned.currency)
                      : 'Pendiente'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RentalDetailsCard;
