
import { Product } from '@/domain/models/Product';

interface SelectedProductDisplayProps {
  product: Product;
}

const SelectedProductDisplay = ({ product }: SelectedProductDisplayProps) => {
  return (
    <div className="bg-accent/10 p-4 rounded-md mb-4">
      <h3 className="font-medium">{product.name}</h3>
      <p className="text-sm text-muted-foreground">{product.description}</p>
      <div className="mt-2 text-sm">
        <span className="font-medium">Precio: </span>
        <span>Desde {product.price.daily}€/día</span>
        {product.price.deposit && (
          <span className="ml-2">| Fianza: {product.price.deposit}€</span>
        )}
      </div>
    </div>
  );
};

export default SelectedProductDisplay;
