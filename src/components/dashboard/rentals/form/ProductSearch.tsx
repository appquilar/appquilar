
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Product } from '@/domain/models/Product';

interface ProductSearchProps {
  productSearch: string;
  onSearchChange: (value: string) => void;
  filteredProducts: Product[];
  onProductSelect: (product: Product) => void;
  isLoading: boolean;
}

const ProductSearch = ({
  productSearch,
  onSearchChange,
  filteredProducts,
  onProductSelect,
  isLoading
}: ProductSearchProps) => {
  return (
    <div className="relative mb-6">
      <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring focus-within:border-input">
        <Search className="ml-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar producto..."
          value={productSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
      
      {productSearch && (
        <div className="absolute z-10 mt-1 w-full border rounded-md bg-background shadow-lg">
          {isLoading ? (
            <div className="p-2 text-sm text-muted-foreground">Cargando productos...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">No se encontraron productos</div>
          ) : (
            <ul>
              {filteredProducts.map((product) => (
                <li 
                  key={product.id}
                  className="p-2 hover:bg-accent cursor-pointer text-sm"
                  onClick={() => onProductSelect(product)}
                >
                  <div className="font-medium">{product.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Desde {product.price.daily}€/día
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSearch;
