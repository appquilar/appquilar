
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Phone } from 'lucide-react';
import { ProductCompany } from './ProductCard';

interface CompanyInfoProps {
  company: ProductCompany;
  locationLabel?: string;
  onContact: () => void;
  isLoggedIn: boolean;
}

const CompanyInfo = ({ company, locationLabel, onContact, isLoggedIn }: CompanyInfoProps) => {
  const hasLocation = Boolean(locationLabel && locationLabel.trim().length > 0);

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
              <span>{locationLabel}</span>
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-border mt-4 pt-4">
        <Button 
          className="w-full mb-2 gap-2" 
          onClick={onContact}
        >
          <Phone size={16} />
          Contactar para Alquilar
        </Button>
      </div>
    </div>
  );
};

export default CompanyInfo;
