import { Product } from '@/domain/models/Product';

interface SelectedProductDisplayProps {
  product: Product;
}

const getBasePrice = (product: Product): number | null => {
  const tier = product.price?.tiers?.[0];
  return tier ? tier.pricePerDay : null;
};

const SelectedProductDisplay = ({ product }: SelectedProductDisplayProps) => {
  return (
    <div className="p-3 bg-muted rounded-md mt-2">
      <h3 className="font-medium">{product.name}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
      <div className="mt-2 text-sm">
        {getBasePrice(product) !== null ? (
          <span>Desde {getBasePrice(product)}€/día</span>
        ) : (
          <span>Precio no disponible</span>
        )}
        {product.price.deposit !== undefined && product.price.deposit !== null && (
          <span className="ml-2">| Fianza: {product.price.deposit}€</span>
        )}
      </div>
    </div>
  );
};

export default SelectedProductDisplay;
