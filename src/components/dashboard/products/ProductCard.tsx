
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import { Product } from '@/components/products/ProductCard';

interface ProductCardProps {
  product: Product;
  onEdit: (productId: string) => void;
  onDelete: (productId: string) => void;
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
      <CardFooter className="pt-2 pb-4 flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={() => onEdit(product.id)}
        >
          <Edit size={14} />
          Editar
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={() => onDelete(product.id)}
        >
          <Trash size={14} />
          Eliminar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
