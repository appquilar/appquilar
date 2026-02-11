
import { Button } from "@/components/ui/button";

interface ProductFormActionsProps {
  isSubmitting: boolean;
  isSubmitDisabled?: boolean;
  onCancel: () => void;
}

const ProductFormActions = ({ isSubmitting, isSubmitDisabled = false, onCancel }: ProductFormActionsProps) => {
  return (
    <div className="flex justify-end gap-3 mt-8 mb-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" disabled={isSubmitting || isSubmitDisabled}>
        {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
      </Button>
    </div>
  );
};

export default ProductFormActions;
