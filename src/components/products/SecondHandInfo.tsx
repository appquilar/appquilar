
import React from 'react';
import { Product } from '@/domain/models/Product';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag, Info, MessageCircle } from 'lucide-react';

interface SecondHandInfoProps {
  product: Product;
  onContactClick: () => void;
}

const SecondHandInfo = ({ product, onContactClick }: SecondHandInfoProps) => {
  if (!product.secondHand) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Información de compra</h2>
      
      {/* Price information */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Precio de venta</p>
              <p className="text-3xl font-semibold">{product.secondHand.price.toFixed(2)} €</p>
            </div>
            {product.secondHand.negotiable && (
              <div className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full flex items-center">
                <Tag size={14} className="mr-1" />
                Precio negociable
              </div>
            )}
          </div>
          
          {product.secondHand.additionalInfo && (
            <div className="mb-6">
              <div className="flex items-center text-sm font-medium mb-2">
                <Info size={14} className="mr-2" />
                Información adicional
              </div>
              <p className="text-muted-foreground text-sm">
                {product.secondHand.additionalInfo}
              </p>
            </div>
          )}
          
          <Button 
            className="w-full flex items-center gap-2" 
            onClick={onContactClick}
          >
            <MessageCircle size={18} />
            Contactar con el vendedor
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecondHandInfo;
