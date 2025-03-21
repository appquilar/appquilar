
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Share, MapPin, Phone } from 'lucide-react';
import { Star } from 'lucide-react';
import { Product } from './ProductCard';
import { toast } from 'sonner';

interface ProductInfoProps {
  product: Product;
  onContact: () => void;
  isLoggedIn: boolean;
}

const ProductInfo = ({ product, onContact, isLoggedIn }: ProductInfoProps) => {
  const [selectedPeriod, setSelectedPeriod] = React.useState<'hourly' | 'daily' | 'weekly' | 'monthly'>('daily');
  
  // Manejar clic en botón de contacto
  const handleContact = () => {
    if (!isLoggedIn) {
      toast.error("Debes iniciar sesión para contactar con el propietario.", {
        action: {
          label: "Iniciar sesión",
          onClick: () => {
            // Aquí podrías abrir el modal de autenticación
          }
        }
      });
      return;
    }
    
    onContact();
  };
  
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center mb-2">
          <span className="text-xs bg-primary/10 px-2 py-0.5 rounded-full text-primary font-medium">
            {product.category.name}
          </span>
          <div className="ml-auto flex items-center">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  className={i < Math.round(product.rating) 
                    ? 'fill-amber-500 text-amber-500' 
                    : 'fill-muted text-muted'
                  } 
                />
              ))}
            </div>
            <span className="text-sm ml-2">
              {product.rating.toFixed(1)} ({product.reviewCount} opiniones)
            </span>
          </div>
        </div>
        
        <h1 className="text-3xl font-display font-semibold tracking-tight mb-3">
          {product.name}
        </h1>
        
        <div className="flex space-x-4 mb-6">
          <Button variant="outline" size="sm" className="gap-2">
            <Heart size={16} />
            <span className="sr-only sm:not-sr-only">Guardar</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Share size={16} />
            <span className="sr-only sm:not-sr-only">Compartir</span>
          </Button>
        </div>
        
        <p className="text-muted-foreground">
          {product.description}
        </p>
      </div>
      
      {/* Precios de alquiler */}
      <div>
        <h3 className="text-lg font-medium mb-3">Precios de Alquiler</h3>
        <Tabs defaultValue="daily" onValueChange={(value) => setSelectedPeriod(value as any)}>
          <TabsList className="w-full grid grid-cols-4">
            {product.price.hourly && (
              <TabsTrigger value="hourly">Por hora</TabsTrigger>
            )}
            <TabsTrigger value="daily">Por día</TabsTrigger>
            {product.price.weekly && (
              <TabsTrigger value="weekly">Por semana</TabsTrigger>
            )}
            {product.price.monthly && (
              <TabsTrigger value="monthly">Por mes</TabsTrigger>
            )}
          </TabsList>
          
          {product.price.hourly && (
            <TabsContent value="hourly" className="pt-4">
              <div className="flex items-baseline">
                <span className="text-3xl font-semibold">{product.price.hourly.toFixed(2)}€</span>
                <span className="text-muted-foreground ml-2">/ hora</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Ideal para proyectos cortos o tareas rápidas.
              </p>
            </TabsContent>
          )}
          
          <TabsContent value="daily" className="pt-4">
            <div className="flex items-baseline">
              <span className="text-3xl font-semibold">{product.price.daily.toFixed(2)}€</span>
              <span className="text-muted-foreground ml-2">/ día</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Perfecto para proyectos de un día o eventos.
            </p>
          </TabsContent>
          
          {product.price.weekly && (
            <TabsContent value="weekly" className="pt-4">
              <div className="flex items-baseline">
                <span className="text-3xl font-semibold">{product.price.weekly.toFixed(2)}€</span>
                <span className="text-muted-foreground ml-2">/ semana</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Ideal para proyectos extendidos, ahorra comparado con tarifas diarias.
              </p>
            </TabsContent>
          )}
          
          {product.price.monthly && (
            <TabsContent value="monthly" className="pt-4">
              <div className="flex items-baseline">
                <span className="text-3xl font-semibold">{product.price.monthly.toFixed(2)}€</span>
                <span className="text-muted-foreground ml-2">/ mes</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Mejor valor para proyectos a largo plazo o uso regular.
              </p>
            </TabsContent>
          )}
        </Tabs>
      </div>
      
      {/* Información de la empresa */}
      <div className="bg-secondary rounded-lg p-4">
        <h3 className="text-sm font-medium uppercase tracking-wider mb-3">
          Proporcionado por
        </h3>
        <div className="flex items-center">
          <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full mr-3">
            {product.company.name.charAt(0)}
          </div>
          <div>
            <h4 className="font-medium">{product.company.name}</h4>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin size={14} className="mr-1" />
              <span>Madrid, España</span>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-4 pt-4">
          <Button 
            className="w-full mb-2 gap-2" 
            onClick={handleContact}
          >
            <Phone size={16} />
            Contactar para Alquilar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
