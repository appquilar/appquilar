
import { format, differenceInDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Product } from './ProductCard';

interface RentalSummaryProps {
  selectedStartDate: Date | null;
  selectedEndDate: Date | null;
  product: Product;
  onContactClick: () => void;
}

const RentalSummary = ({ 
  selectedStartDate, 
  selectedEndDate, 
  product, 
  onContactClick 
}: RentalSummaryProps) => {
  // Calculate rental cost
  const calculateTotal = () => {
    if (!selectedStartDate || !selectedEndDate || !product?.price.daily) {
      return 0;
    }
    const days = differenceInDays(selectedEndDate, selectedStartDate) + 1;
    return days * product.price.daily;
  };

  return (
    <div className="bg-white rounded-lg border p-6 sticky top-24">
      <h3 className="text-xl font-semibold mb-4">Resumen de Alquiler</h3>
      
      {selectedStartDate && selectedEndDate ? (
        <div className="space-y-4">
          <div className="flex justify-between py-2 border-b">
            <span>Periodo:</span>
            <span className="font-medium">
              {format(selectedStartDate, 'PP')} - {format(selectedEndDate, 'PP')}
            </span>
          </div>
          
          <div className="flex justify-between py-2 border-b">
            <span>Duración:</span>
            <span className="font-medium">
              {differenceInDays(selectedEndDate, selectedStartDate) + 1} días
            </span>
          </div>
          
          <div className="flex justify-between py-2 border-b">
            <span>Precio por día:</span>
            <span className="font-medium">{product?.price.daily}€</span>
          </div>
          
          <div className="flex justify-between py-2 border-b text-lg font-semibold">
            <span>Total:</span>
            <span>
              {calculateTotal().toFixed(2)}€
            </span>
          </div>
          
          <Button 
            className="w-full mt-4" 
            size="lg"
            onClick={onContactClick}
          >
            Solicitar Alquiler
          </Button>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-muted-foreground mb-4">
            Selecciona fechas en el calendario para calcular el precio del alquiler
          </p>
          <Button 
            variant="outline" 
            className="w-full"
            disabled
          >
            Solicitar Alquiler
          </Button>
        </div>
      )}
    </div>
  );
};

export default RentalSummary;
