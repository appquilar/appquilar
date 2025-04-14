
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import { Product } from '@/domain/models/Product';

interface ProductCardProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}

const ProductCard = ({ product, onEdit, onDelete }: ProductCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-sm transition-shadow">
      <div className="aspect-[4/3] relative">
        <img 
          src={product.thumbnailUrl || product.imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback for broken images
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
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
      <CardFooter className="pt-2 pb-4 flex flex-col gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1 w-full"
          onClick={onEdit}
        >
          <Edit size={14} />
          Editar
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1 w-full text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={onDelete}
        >
          <Trash size={14} />
          Eliminar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
