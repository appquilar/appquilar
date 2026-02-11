import { Input } from '@/components/ui/input';
import { Product } from '@/domain/models/Product';

interface ProductSearchProps {
  productSearch: string;
  onSearchChange: (value: string) => void;
  filteredProducts: Product[];
  onProductSelect: (product: Product) => void;
  isLoading: boolean;
}

const getBasePrice = (product: Product): number | null => {
  const tier = product.price?.tiers?.[0];
  return tier ? tier.pricePerDay : null;
};

const ProductSearch = ({
  productSearch,
  onSearchChange,
  filteredProducts,
  onProductSelect,
  isLoading
}: ProductSearchProps) => {
  return (
    <div className="relative">
      <Input
        placeholder="Buscar por nombre, ID o referencia interna..."
        value={productSearch}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      {productSearch && (
        <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
          {isLoading ? (
            <div className="p-2 text-sm text-muted-foreground">Cargando productos...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">No se encontraron productos</div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="p-2 hover:bg-accent cursor-pointer"
                onClick={() => onProductSelect(product)}
              >
                <div className="font-medium">{product.name}</div>
                <div className="text-xs text-muted-foreground">
                  ID: {product.id}
                </div>
                <div className="text-xs text-muted-foreground">
                  Ref: {product.internalId || 'sin referencia'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {getBasePrice(product) !== null
                    ? `Desde ${getBasePrice(product)}€/día`
                    : 'Precio no disponible'}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSearch;
