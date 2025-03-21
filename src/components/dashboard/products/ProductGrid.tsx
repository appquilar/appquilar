
import { Product } from '@/components/products/ProductCard';
import ProductCard from './ProductCard';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductGridProps {
  products: Product[];
  onEdit: (productId: string) => void;
  onDelete: (productId: string) => void;
  onAdd: () => void;
}

const ProductGrid = ({ products, onEdit, onDelete, onAdd }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg">
        <h3 className="text-lg font-medium mb-2">No products found</h3>
        <p className="text-muted-foreground mb-6">Try adjusting your search or add a new product.</p>
        <Button onClick={onAdd} className="gap-2">
          <Plus size={16} />
          Add New Product
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map(product => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      ))}
    </div>
  );
};

export default ProductGrid;
