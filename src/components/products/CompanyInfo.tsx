
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Clock3, ShieldCheck, Package, Eye } from 'lucide-react';
import { ProductCompany } from './ProductCard';
import { usePublicCompanyProfile } from '@/application/hooks/usePublicCompanyProfile';

interface CompanyInfoProps {
  company: ProductCompany;
  locationLabel?: string;
  onContact: () => void;
  isLoggedIn: boolean;
}

const CompanyInfo = ({ company, locationLabel, onContact, isLoggedIn }: CompanyInfoProps) => {
  const companyProfileQuery = usePublicCompanyProfile(company.slug || null);
  const companyProfile = companyProfileQuery.data ?? null;

  const locationFromProfile = [
    companyProfile?.location.city,
    companyProfile?.location.state,
    companyProfile?.location.country,
  ]
    .filter((item): item is string => Boolean(item && item.trim().length > 0))
    .join(", ");

  const displayLocation = locationFromProfile || locationLabel || null;
  const hasLocation = Boolean(displayLocation && displayLocation.trim().length > 0);

  const responseMinutes = companyProfile?.trustMetrics.averageFirstResponseMinutes30d ?? null;
  const responseRate24h = companyProfile?.trustMetrics.responseRate24h30d ?? 0;
  const showTrustMetrics = Boolean(companyProfile);

  const responseTimeLabel = responseMinutes === null
    ? "Sin datos"
    : `${Math.round(responseMinutes)} min`;
  const responseRateLabel = `${Math.round(responseRate24h * 100)}%`;

  return (
    <div className="bg-secondary rounded-lg p-4">
      <h3 className="text-sm font-medium uppercase tracking-wider mb-3">
        Proporcionado por
      </h3>
      <div className="flex items-center">
        <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full mr-3">
          {company.name.charAt(0)}
        </div>
        <div>
          <h4 className="font-medium">{company.name}</h4>
          {hasLocation && (
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin size={14} className="mr-1" />
              <span>{displayLocation}</span>
            </div>
          )}
        </div>
      </div>

      {showTrustMetrics && (
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-background px-3 py-2">
            <p className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              <Package size={12} />
              Productos activos
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {companyProfile.trustMetrics.activeProductsCount} / {companyProfile.trustMetrics.totalProductsCount}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-background px-3 py-2">
            <p className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              <Clock3 size={12} />
              Respuesta media
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">{responseTimeLabel}</p>
          </div>

          <div className="rounded-xl border border-border bg-background px-3 py-2">
            <p className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              <ShieldCheck size={12} />
              Respuesta 24h
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">{responseRateLabel}</p>
          </div>

          <div className="rounded-xl border border-border bg-background px-3 py-2">
            <p className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              <Eye size={12} />
              Visitas 30d
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {companyProfile.trustMetrics.views30d}
            </p>
          </div>
        </div>
      )}

      <div className="border-t border-border mt-4 pt-4">
        <Button 
          className="w-full mb-2 gap-2" 
          onClick={onContact}
        >
          <Phone size={16} />
          Contactar para Alquilar
        </Button>
        {!isLoggedIn && (
          <p className="text-xs text-muted-foreground">
            Inicia sesion para contactar con el proveedor.
          </p>
        )}
      </div>
    </div>
  );
};

export default CompanyInfo;
