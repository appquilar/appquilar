
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import { Link } from 'react-router-dom';

// Pricing structure for products
export interface ProductPrice {
  hourly?: number;
  daily: number;
  weekly?: number;
  monthly?: number;
}

// Product company information
export interface ProductCompany {
  id: string;
  name: string;
  slug: string;
}

// Product category information
export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

// Availability period for a product
export interface AvailabilityPeriod {
  id: string;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
  status: 'available' | 'unavailable' | 'pending' | 'rented';
}

// Core product data structure
export interface Product {
  id: string;
  internalId?: string;
  name: string;
  slug: string;
  imageUrl: string;
  thumbnailUrl: string;
  description: string;
  price: ProductPrice;
  company: ProductCompany;
  category: ProductCategory;
  rating: number;
  reviewCount: number;
  availability?: AvailabilityPeriod[];
}

// Component props
interface ProductCardProps {
  product: Product;
  onEdit?: (productId: string) => void;
  onDelete?: (productId: string) => void;
}

const ProductCard = ({ product, onEdit, onDelete }: ProductCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-sm transition-shadow">
      <div className="aspect-[4/3] relative">
        <img 
          src={product.thumbnailUrl || product.imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {product.internalId && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {product.internalId}
          </div>
        )}
      </div>
      <CardHeader className="py-3">
        <CardTitle className="text-base font-medium truncate">
          {product.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        <p className="text-xs text-muted-foreground mb-2">
          {product.category.name} • {product.price.daily}€/día
        </p>
        <p className="text-sm line-clamp-2">{product.description}</p>
      </CardContent>
      {(onEdit || onDelete) && (
        <CardFooter className="pt-2 pb-4 flex justify-between">
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={() => onEdit(product.id)}
            >
              <Edit size={14} />
              Editar
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => onDelete(product.id)}
            >
              <Trash size={14} />
              Eliminar
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default ProductCard;
