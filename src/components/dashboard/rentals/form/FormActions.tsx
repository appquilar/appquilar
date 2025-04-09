
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

const FormActions = ({ isSubmitting, onCancel }: FormActionsProps) => {
  return (
    <div className="flex justify-end space-x-4 pt-6">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancelar
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : "Crear Alquiler"}
      </Button>
    </div>
  );
};

export default FormActions;
