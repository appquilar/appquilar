
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
        <span className="font-medium">Precios: </span>
        <span>{product.price.daily}€ diario | {product.price.weekly}€ semanal | {product.price.monthly}€ mensual</span>
      </div>
    </div>
  );
};

export default SelectedProductDisplay;
