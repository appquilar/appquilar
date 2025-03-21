
import { Button } from "@/components/ui/button";

interface ProductFormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

const ProductFormActions = ({ isSubmitting, onCancel }: ProductFormActionsProps) => {
  return (
    <div className="flex justify-end gap-3">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
      </Button>
    </div>
  );
};

export default ProductFormActions;
